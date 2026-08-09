import {Injectable, Injector, inject} from '@angular/core';
import {PeerConnection, PeerConnectionState, SecurityState} from './PeerConnection';
import {Client, ConnectionState, WebSocketServerConnection} from '../websocket/WebSocketServerConnection';
import {WebSocketService} from '../websocket/web-socket-service';
import {ToastService, ToastType} from '../ui/toast-service';
import {
  PeerAnswer,
  PeerAnswerForward,
  PeerOffer,
  PeerOfferForward,
  TrackMetadataMessage
} from '../../../api/onyx-server';
import {
  NOTIFICATION_USER_JOINED_CHANNEL,
  NOTIFICATION_USER_LEFT_CHANNEL,
  NotificationService
} from '../notification.service';
import {MediaService} from './media-service';
import {removeItemFromList} from '../../util';

@Injectable({
  providedIn: 'root'
})
export class PeerConnectionService {
  private injector = inject(Injector);
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  private mediaService = inject(MediaService);


  peers: PeerConnection[] = [];


  private webSocketService!: WebSocketService;

  constructor() {
    setTimeout(() => {
      this.webSocketService = this.injector.get(WebSocketService);
      this.webSocketService.addHandler(PeerOfferForward.TypeEnum.PeerOfferForward, (e, c) => this.onPeerOfferForward(e as PeerOfferForward, c))
      this.webSocketService.addHandler(PeerAnswerForward.TypeEnum.PeerAnswerForward, (e, c) => this.onPeerAnswerForward(e as PeerAnswerForward, c))
    }, 50);

    setInterval(() => {
      this.pollAudioLevels();
    }, 250)
  }


  /**
   * Updates the connection by adding or removing clients based
   * on if the clients are in our channel - if we are in a channel anyway.
   * TODO is not really reactive yet, instead checks everything and creates list of whom to add or remove
   */
  public updatePeerConnections() {
    if (!this.webSocketService.connection //no connection (anymore)
      || this.webSocketService.connection.state !== ConnectionState.CONNECTED) { //not in connected state
      console.log("peer: removing all connections because we are not connected to any server")
      this.peers.forEach(p => this.disconnect(p))
      return;
    }

    const clientsInChannel = new Set(this.webSocketService.connection.clients
      .filter(c => c.channel == this.webSocketService.connection?.me.channel) //only in same channel
      .filter(c => c.id !== this.webSocketService.connection?.identity.id) //remove me
    );
    const clientsConnected = new Set(this.peers.map(peer => peer.client));

    const clientsInChannelThatShouldConnect = [...clientsInChannel].filter(item => !clientsConnected.has(item));
    const clientsConnectedThatAreNotInChannel = [...clientsConnected].filter(item => !clientsInChannel.has(item));

    if (clientsConnectedThatAreNotInChannel.length > 0) {
      console.log("peer: disconnecting from " + JSON.stringify(clientsConnectedThatAreNotInChannel.map(c => c.username)))
      clientsConnectedThatAreNotInChannel.forEach(client => {
        this.peers.filter(p => p.client === client)
          .forEach(p => this.disconnect(p))
      })
    }

    if (clientsInChannelThatShouldConnect.length > 0) {
      console.log("peer: connecting to " + JSON.stringify(clientsInChannelThatShouldConnect.map(c => c.username)))
      clientsInChannelThatShouldConnect.forEach(client => this.connectToPeer(client));
    }
  }


  /**
   * Connect to a peer given it's client data
   * @param client the client to connect to
   */
  public async connectToPeer(client: Client): Promise<PeerConnection> {
    console.log("peer: connecting to " + client.username)
    const iceServers = this.webSocketService.connection?.config.iceServers;
    const config: RTCConfiguration = {
      //  iceCandidatePoolSize: 15,
      //   bundlePolicy: 'max-bundle',
      //   rtcpMuxPolicy: 'require',
      iceServers: iceServers as RTCIceServer[],
    };
    if (iceServers && iceServers.length < 2)
      console.warn("Got less than two ice servers (" + iceServers.length + "), this may be a problem")
    const pc: RTCPeerConnection = new RTCPeerConnection(config);
    const peer: PeerConnection = {
      connection: pc,
      client: client,
      state: PeerConnectionState.WaitingForOffer,
      securityState: SecurityState.UNTESTED,
      streams: {
        unknownStreams: new MediaStream(),
        talking: false
      },
      dataStream: {
        messageQueue: []
      }
    }
    this.peers.push(peer);

    if (this.shouldConnectAsNicePeer(peer)) {
      peer.dataStream.channel = pc.createDataChannel(DATACHANNEL)
      this.initDataChannel(peer, peer.dataStream.channel!);
    }

    pc.onnegotiationneeded = async () => {
      console.log("peer: connection needs renegotiating");
      await this.negotiateConnection(peer, true);
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("peer: ice: sending ice data");
      }
    };
    pc.oniceconnectionstatechange = (event) => {
      console.log("peer: ice: connection state has changed to " + pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed') {
        console.log("peer: ice: state is 'failed', renegotiating")
        this.negotiateConnection(peer, false);
      }
    }

    pc.ondatachannel = (event) => {
      console.log("peer: data: received datachannel from peer");
      this.initDataChannel(peer, event.channel);
    }

    pc.onsignalingstatechange = () => {
      console.log("peer: state: " + client.username + " changed to " + pc.signalingState);
      switch (pc.signalingState) {
        case "closed":
          peer.state = PeerConnectionState.Closed;
          break;
        case "have-local-offer":
          peer.state = PeerConnectionState.Offered;
          break;
        case "have-local-pranswer":
          peer.state = PeerConnectionState.Answered;
          break;
        case "have-remote-offer":
          peer.state = PeerConnectionState.Offered
          break;
        case "have-remote-pranswer":
          break;
        case "stable":
          peer.state = PeerConnectionState.Connected;
          //in case of a stream delete a new stable channel
          this.sendTranceiverMid(peer);
          this.addAllExistingTracksToPeer(peer);
          break;
      }
    }

    pc.ontrack = event => {
      if (event.streams.length != 1) //can this ever happen?
        console.warn("peer: Expected 1 stream, got " + event.streams.length + ". using the first one")
      this.onPeerTrackAdded(peer, event.track);
    }
    console.log("peer: setup clear, waiting for ice config");

    this.negotiateConnection(peer, false);
    this.notificationService.notify(NOTIFICATION_USER_JOINED_CHANNEL);
    return peer;
  }

  /**
   * Disconnect from a peer
   * @param peer the peer to disconnect to
   */
  public disconnect(peer: PeerConnection) {
    console.log("peer: disconnecting peer " + peer.client.username)
    this.peers.splice(this.peers.indexOf(peer), 1);
    const state = peer.connection.connectionState;
    if (state == "closed" || state == "disconnected" || state == "failed")
      console.warn("peer: connecting is already in state " + state);
    peer.connection.close();
    this.notificationService.notify(NOTIFICATION_USER_LEFT_CHANNEL);
  }

  private onPeerTrackAdded(peer: PeerConnection, track: MediaStreamTrack) {
    console.log("peer: track: received a new unknown track: " + track.id + " - " + track.kind + " - " + track.label);
    peer.streams.unknownStreams.addTrack(track)
    track.onended = () => {
      console.log("peer: track: track has ended")
      this.onPeerTrackRemoved(peer, track);
    }
    track.onmute = () => {
      console.log("peer: track: track has been muted")
      this.onPeerTrackRemoved(peer, track);
    }
    track.onunmute = () => {
      console.log("peer: track: track has been unmuted")
      this.onPeerTrackAdded(peer, track);//TODO test - feels like it's working
    }

  }

  private onPeerTrackRemoved(peer: PeerConnection, track: MediaStreamTrack) {
    console.log("peer: track: removing track " + track.label + " from peer " + peer.client.username)
    this.mediaService.removeTrackFromPeerStream(peer.streams, track);
  }


  /**
   * As only one peer should connect to the other and not
   * both at the same time, the one with the higher ID
   * is responsible for connecting, the other passively receives the first message
   * @param peer
   */
  public shouldConnectAsNicePeer(peer: PeerConnection): boolean {
    if (!this.webSocketService.connection) {
      console.warn("peer: cannot compare peer niceness - no connection")
      return false;
    }
    return peer.client.id > this.webSocketService.connection.identity.id;
  }


  /**
   * adds all tracks to a peer.
   * should be called when connecting to a new peer to send all existing tracks.
   * when a track already exists on that peer it is ignored
   * @param peer the peer
   * @private
   */
  private addAllExistingTracksToPeer(peer: PeerConnection) {
    let addedTrack = 0;
    if (this.mediaService.localStream.screen)
      this.mediaService.localStream.screen.getTracks().forEach(track => {
        if (peer.connection.getSenders().filter(s => s.track == track).length > 0) {
          return;
        }
        peer.connection.addTrack(track, this.mediaService.localStream.screen!);
        addedTrack++;
      })
    if (this.mediaService.localStream.cameraMic)
      this.mediaService.localStream.cameraMic.getTracks().forEach(track => {
        if (peer.connection.getSenders().filter(s => s.track == track).length > 0) {
          return;
        }
        peer.connection.addTrack(track, this.mediaService.localStream.cameraMic!);
        addedTrack++;
      })

    if (addedTrack > 0) {
      console.log("peer: track: adding " + addedTrack + " track(s) to peer " + peer.client.username)
      this.negotiateConnection(peer, true);
    }
  }

  /**
   * Adds a new track to all peers
   * @param track the track
   * @param stream the stream element
   * @param label the label the client should get
   * @private
   */
  public addTrackToPeers(track: MediaStreamTrack, stream: MediaStream, label: TrackMetadataMessage.LabelEnum) {
    this.peers.forEach(peer => {
      try {
        console.log("peer: user " + peer.client.username + " gets new track", track)
        peer.connection.addTrack(track, stream);
        this.negotiateConnection(peer, true);
      } catch (e) {
        console.log("peer: could not add track to peer", e)
      }
    });
  }


  /**
   * removes an (!!not stopped!!) track from all peers
   * @param track the track to remove
   */
  removeTrackFromPeers(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      console.log("peer: (" + peer.client.username + ") removing from track")
      const sender = peer.connection.getSenders().filter(s => s.track && s.track.id == track.id);
      if (sender.length !== 1) {
        console.warn("peer: update: found " + sender.length + " sender matching track, using first", peer.connection.getSenders())
      }
      peer.connection.removeTrack(sender[0]);
      this.negotiateConnection(peer, true);
    });
  }

  private sendTranceiverMid(peer: PeerConnection) {
    peer.connection.getTransceivers().forEach(transceiver => {
      const track = transceiver.sender.track;
      if (!track)
        return;
      let label: TrackMetadataMessage.LabelEnum | undefined;
      const localStreams = this.mediaService.localStream;
      if (localStreams.screen && localStreams.screen.getTrackById(track.id)) {
        label = 'SCREEN';
      }
      if (localStreams.cameraMic && localStreams.cameraMic.getTrackById(track.id)) {
        label = 'CAMERAMIC'
      }
      const mid = transceiver.mid;
      if (!label || mid == null) {
        console.warn("no label for track",
          label, track, transceiver, transceiver.mid,
          peer.streams.screen?.getTracks(), peer.streams.cameraMic?.getTracks(), peer.streams.unknownStreams.getTracks(),
          this.mediaService.localStream.screen?.getTracks(), this.mediaService.localStream.cameraMic?.getTracks(), this.mediaService.localStream.unknownStreams.getTracks())
        return;
      }
      console.log("peer: data: sending transceiver mid " + transceiver!.mid + " for " + label)
      this.sendToPeer(peer, {
        mid: mid,
        type: "TrackMetadataMessage",
        label: label,
      } as TrackMetadataMessage)
    })
  }

  private pollAudioLevels() {
    this.peers.forEach(peer => {
      peer.streams.talking = false;
      const stream = peer.streams.cameraMic;
      if (!stream)
        return;
      if (stream.getAudioTracks().length == 0)
        return;
      const track = stream.getTracks()[0];
      peer.connection.getStats(track).then(stats => {
        stats.forEach(stat => {
          if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
            const level = (stat as unknown as RTCInboundRtpStreamStats).audioLevel;
            peer.streams.talking = level !== undefined && level >= AUDIO_SPEAKING_LEVEL;
            console.log("peer: audio: level for peer " + peer.client.username + " is " + level);
          }
        })

      })
    })
  }


  /*
      Peer Offers + Answers messages
   */
  /**
   * Negotiate a direct connection to a peer through our server
   * Should be called:
   * (1) on start of the connection
   * (2) when a new track is added from us (like a new screen share)
   * Every time the tracks change, the connection has to be rebuild from scratch
   * @param peer the peer to negotiate to
   * @param force true if we should force it, e.g. on a new source. false for fresh connections
   */
  public async negotiateConnection(peer: PeerConnection, force: boolean) {
    if (!force && !this.shouldConnectAsNicePeer(peer)) {
      console.log("peer: negotiate: waiting for " + peer.client.id + " to connect (wait mode)")
      return;
    }
    const pc = peer.connection;
    if (peer.state == PeerConnectionState.Connected)
      console.log("peer: negotiate: restarting connection...");

    console.log("peer: negotiate: offer sending");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.webSocketService.send(this.webSocketService.connection!,
      {
        clientTo: peer.client.id,
        type: PeerOffer.TypeEnum.PeerOffer,
        offer: offer
      } as PeerOffer)
    peer.state = PeerConnectionState.Offered;
  }

  private async onPeerOfferForward(e: PeerOfferForward, c: WebSocketServerConnection) {
    console.log("peer: negotiate: peer wants to connect")
    const peer = this.peers.find(p => p.client.id == e.clientFrom);
    if (peer == undefined) {
      console.warn("peer: negotiate: could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client. known clients are " + JSON.stringify(c.clients))
      return;
    }
    peer.state = PeerConnectionState.Answered;
    await peer.connection.setRemoteDescription(e.offer);
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    console.log("peer: negotiate: offer received -> answer sending");
    this.webSocketService.send(c, {
      answer: answer,
      type: PeerAnswer.TypeEnum.PeerAnswer,
      clientTo: peer.client.id
    } as PeerAnswer)
    this.sendTranceiverMid(peer);
  }

  private async onPeerAnswerForward(e: PeerAnswerForward, c: WebSocketServerConnection) {
    console.log("peer: negotiate: peer did send answer")
    const peer = this.peers.find(p => p.client.id == e.clientFrom);
    if (peer == undefined) {
      console.warn("peer: negotiate: could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client")
      return;
    }
    try {
      await peer.connection.setRemoteDescription(e.answer);
      this.sendTranceiverMid(peer);
    } catch (e: any) {
      this.toastService.create({
        title: "No connection to " + peer.client.username,
        message: "Could not receive data stream from client: " + JSON.stringify(e),
        type: ToastType.Error
      })
      console.error("Could not answer forward")
      console.error(e);
      peer.state = PeerConnectionState.Error;
      return;
    }
    peer.state = PeerConnectionState.Connected;
    console.log("peer: negotiate: offer send -> answer received -> connected");
  }

  /*
   * DATA
   */

  private initDataChannel(peer: PeerConnection, channel: RTCDataChannel) {
    console.log("peer: data: channel is initialised (but not open!) with  label " + channel.label + "(" + channel.id + ")");
    if (peer.dataStream.channel && peer.dataStream.channel !== channel) {
      console.warn("A datachannel already exists");
    }
    peer.dataStream.channel = channel;
    channel.onmessage = (message) => {
      console.log("peer: data: received message: ", message)
      const messageData = JSON.parse(message.data);
      switch (messageData.type) {
        case TrackMetadataMessage.TypeEnum.TrackMetadataMessage:
          this.onTrackMetadataMessage(peer, messageData);
          break;
        default:
          console.error("peer: data: No listener for message", message)
          break;
      }
    }
    channel.onopen = () => {
      console.log("peer: data: channel is open. " + peer.dataStream.messageQueue.length + " messages in queue.")
      peer.dataStream.messageQueue.forEach((message) => {
        this.sendToPeer(peer, message);
        removeItemFromList(peer.dataStream.messageQueue, message);
      })
    }
    channel.onerror = (e) => {
      console.warn("peer: data: channel closed", e)
    }
    //TODO onClose, on.... events
    //TODO send authchallengerequest with owns key id
    //TODO receive authchallengerequest from other, valide key id
    //TODO send fulfilled authchallengerequest
  }

  private sendToPeer(peer: PeerConnection, message: any) {
    if (peer.dataStream.channel === undefined || peer.dataStream.channel.readyState !== 'open') {
      console.log("peer: data: adding message to queue because channel state is " +
        (peer.dataStream.channel ? peer.dataStream.channel.readyState : 'not-available'))
      peer.dataStream.messageQueue.push(message);
      return;
    }
    console.log("peer: data: sending ", message)
    peer.dataStream.channel.send(JSON.stringify(message));
  }

  private onTrackMetadataMessage(peer: PeerConnection, message: TrackMetadataMessage) {
    const mid = message.mid;
    const transceiver = peer.connection.getTransceivers().find(t => t.mid == mid);
    const track = transceiver?.receiver?.track;

    if (!track) {
      console.warn("peer: data: received invalid mid",
        message, transceiver, track,
        peer.streams.screen?.getTracks(), peer.streams.cameraMic?.getTracks(), peer.streams.unknownStreams.getTracks());
      return;
    }
    console.log("peer: data: changing track from unknown to " + message.label, peer.streams.unknownStreams.getTracks());
    if (peer.streams.unknownStreams.getTrackById(track.id)) {
      this.mediaService.addTrackForPeerStream(peer.streams, track, message.label);
      const t = peer.streams.unknownStreams.getTrackById(track.id);
      peer.streams.unknownStreams.removeTrack(t!);
    } else {
      if (peer.streams.screen?.getTrackById(track.id) == null && peer.streams.cameraMic?.getTrackById(track.id) == null) {
        console.warn("peer: data: not moving track because it is not unknown (or not known?)",
          track, peer.streams.screen?.getTracks(), peer.streams.cameraMic?.getTracks(), peer.streams.unknownStreams.getTracks())
      }
    }
    if (peer.streams.unknownStreams.getTracks().length > 0) {
      console.log("peer:data: there are still unknown tracks for this peer", peer.streams.unknownStreams.getTracks())
    }
  }
}

export const DATACHANNEL = "data-control";
const AUDIO_SPEAKING_LEVEL = .025;
