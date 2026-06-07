import { Injectable, Injector, inject } from '@angular/core';
import {PeerConnection, PeerConnectionState, SecurityState} from './PeerConnection';
import {Client, ConnectionState, WebSocketServerConnection} from '../websocket/WebSocketServerConnection';
import {WebSocketService} from '../websocket/web-socket-service';
import {ToastService, ToastType} from '../toast-service';
import {PeerAnswer, PeerAnswerForward, PeerOffer, PeerOfferForward} from '../../../api/webrtc-server';
import {
  NOTIFICATION_USER_JOINED_CHANNEL,
  NOTIFICATION_USER_LEFT_CHANNEL,
  NotificationService
} from '../notification.service';
import {getMediaTracker, TrackType} from './MediaTracker';

@Injectable({
  providedIn: 'root'
})
export class PeerConnectionService {
  private injector = inject(Injector);
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);


  peers: PeerConnection[] = [];

  /**
   * localStream and sharedStream are synced on it's content.
   * It's preferred by the RTC library.
   * No more then the three defined TrackTypes are allowed concurrently.
   */
  localStream: MediaStream = new MediaStream();

  /**
   * A UI-compatible list of all three possible streams: mic, camera and screen
   * Is synced with localStream
   */
  sharedStreams: Partial<Record<TrackType, MediaStream | undefined>> = {
    [TrackType.Microphone]: undefined,
    [TrackType.Camera]: undefined,
    [TrackType.Screen]: undefined
  };

  private webSocketService!: WebSocketService;

  constructor() {
    setTimeout(() => {
      this.webSocketService = this.injector.get(WebSocketService);
      this.webSocketService.addHandler(PeerOfferForward.TypeEnum.PeerOfferForward, (e, c) => this.onPeerOfferForward(e as PeerOfferForward, c))
      this.webSocketService.addHandler(PeerAnswerForward.TypeEnum.PeerAnswerForward, (e, c) => this.onPeerAnswerForward(e as PeerAnswerForward, c))
    }, 50);
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
      dataChannel: pc.createDataChannel("data"),
      securityState: SecurityState.UNTESTED
    }
    // this.setTracks(peer);
    this.peers.push(peer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("peer: ice: sending ice data");
      }
    };
    pc.oniceconnectionstatechange = (event) => {
      console.log("peer: ice: connection state has changed to " + pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed')
        this.negotiateConnection(peer, false);
    }

    pc.ondatachannel = (event) => {
      console.log("peer: data: channel is active: " + event.type);
      //TODO send authchallengerequest with owns key id
      //TODO receive authchallengerequest from other, valide key id
      //TODO send fulfilled authchallengerequest
    }

    pc.onsignalingstatechange = () => {
      console.log("peer: state: " + client.username + " changed to " + pc.signalingState);
      switch (pc.signalingState) {
        case "closed":
          peer.state = PeerConnectionState.Closed;
          break;
        case "have-local-offer":
          break;
        case "have-local-pranswer":
          break;
        case "have-remote-offer":
          break;
        case "have-remote-pranswer":
          break;
        case "stable":
          peer.state = PeerConnectionState.Connected;
          //in case of a stream delete a new stable channel
          this.addAllExistingTracksToPeer(peer);
          break;
      }
    }

    pc.ontrack = event => {
      if (event.streams.length != 1) //can this ever happen?
        console.warn("peer: Expected 1 stream, got " + event.streams.length + ". using the first one")
      this.onPeerTrackAdded(peer, event.track, event.streams[0]);
    }
    console.log("peer: setup clear, waiting for ice config");

    this.negotiateConnection(peer, false);
    this.notificationService.notify(NOTIFICATION_USER_JOINED_CHANNEL);
    return peer;
  }

  private onPeerTrackAdded(peer: PeerConnection, track: MediaStreamTrack, stream: MediaStream | undefined) {
    console.log("peer: received a new track: " + track.id + " - " + track.kind + " - " + track.label);
    if (stream == undefined && peer.stream == undefined) {
      console.warn("peer: Manually adding a stream")
      peer.stream = new MediaStream();
    } else {
      peer.stream = stream;
    }
    peer.stream!.addTrack(track);
    track.onended = () => {
      this.onPeerTrackRemoved(peer, track);
    }

  }

  private onPeerTrackRemoved(peer: PeerConnection, track: MediaStreamTrack) {
    console.log("Removing track " + track.label + " from peer " + peer.client.username)
    peer.stream!.removeTrack(track);
  }


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
      console.log("peer: waiting for " + peer.client.id + " to connect (wait mode)")
      return;
    }
    console.log("peer: connecting to " + peer.client.id + " (nice mode)")
    const pc = peer.connection;
    if (peer.state == PeerConnectionState.Connected)
      console.log("peer: renegotiating...");
    const offer = await pc.createOffer(); //{iceRestart: true}
    await pc.setLocalDescription(offer);
    this.webSocketService.send(this.webSocketService.connection!,
      {
        clientTo: peer.client.id,
        type: PeerOffer.TypeEnum.PeerOffer,
        offer: offer
      } as PeerOffer)
    peer.state = PeerConnectionState.Offered;
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
   * Switches the state of a track
   * Convenience method for our UI View to simply switch the state
   * @param type the track type
   */
  public async changeTrack(type: TrackType) {
    const media = this.sharedStreams[type];
    if (media) {
      await this.stopTrack(type);
    } else {
      await this.startTrack(type);
    }
  }


  /**
   * Starts a track of the given type
   * If the track already started, an error is displayed
   * @param type the track type
   */
  public async startTrack(type: TrackType) {
    console.log("peer: requesting track " + type)
    if (this.sharedStreams[type]) {
      console.warn("User tried to start the track " + type + " although it's already started")
      this.toastService.create({
        title: type + " is already shared",
        type: ToastType.Error,
        message: 'If the error persists, reload the page'
      });
      return;
    }


    try {
      console.log("peer: Waiting for answer for track")
      const stream = await getMediaTracker().openTrack(type);
      //We cannot stream camera and screen at the same time
      if (type==TrackType.Camera && this.sharedStreams["Screen"]){
        await this.stopTrack(TrackType.Screen)
      }else if (type==TrackType.Screen && this.sharedStreams["Camera"]){
        await this.stopTrack(TrackType.Camera)
      }

      this.sharedStreams[type] = stream;
      console.log("peer: activated track, adding to locals and " + this.peers.length + " peers")
      stream.getTracks().forEach(track => {
        this.localStream.addTrack(track);
        this.addTrackToPeers(track);
        track.onended = event => {
          console.log("peer: track: Track has ended");
          this.removeTrack(track, stream);
        };
      })
    } catch (e: any) {
      console.error("Could not open device", e);
      this.toastService.create({
        title: "Could not open device",
        message: ('message' in e) ? JSON.stringify(e.message) : "Unknown error",
        type: ToastType.Error,
      })
    }
  }


  /**
   * Stops the given track
   * An error is displayed if the track is not running
   * @param type the type
   */
  public async stopTrack(type: TrackType) {
    console.log("deactivating stream " + type)
    const stream = this.sharedStreams[type];
    if (!stream) {
      console.warn("User tried to stop the track " + type + " although it's already stopped / not yet started")
      this.toastService.create({
        title: 'Cannot deactivate stream',
        message: 'The stream is not active',
        type: ToastType.Error,
      })
      return;
    }
    stream.getTracks().forEach(track => {
      this.localStream.removeTrack(track);
      this.removeTrackFromPeers(track);
      track.stop();
    });
    this.sharedStreams[type] = undefined;
  }

  // Only set on start, never when adding or removing inputs
  private setTracks(peer: PeerConnection) {
    if (this.localStream.getTracks().length > 0) {
      console.log("peer: adding " + this.localStream.getTracks().length + " tracks to new peer");
    }
    this.localStream.getTracks().forEach(track => {
      peer.connection.addTrack(track, this.localStream);
    })
  }

  private addAllExistingTracksToPeer(peer: PeerConnection) {
    let addedTrack = 0;
    this.localStream.getTracks().forEach(track => {
      if (peer.connection.getSenders().filter(s => s.track == track).length > 0) {
        return;
      }
      peer.connection.addTrack(track, this.localStream);
      addedTrack++;
    })
    if (addedTrack > 0) {
      console.log("peer: track: adding " + addedTrack + " tracks to peer " + peer.client.username)
      this.negotiateConnection(peer, true);
    }
  }

  /**
   * Adds a new track to all peers
   * @param track the track
   * @private
   */
  private addTrackToPeers(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      console.log("peer: (" + peer.client.username + ") gets new track")
      peer.connection.addTrack(track, this.localStream);
      this.negotiateConnection(peer, true);
    });
  }

  private removeTrackFromPeers(track: MediaStreamTrack) {
    this.peers.filter(peer => {
      console.log("peer: (" + peer.client.username + ") removed from track")
      const sender = peer.connection.getSenders().filter(s => s.track == track);
      if (sender.length > 1)
        console.warn("peer: update: found multiple sender, using first")
      if (sender[0].track)
        sender[0].track.stop()
      peer.connection.removeTrack(sender[0]);
      this.negotiateConnection(peer, true);
    });
  }

  /**
   * Removes a track
   * @param track the track
   * @param stream the local stream
   */
  removeTrack(track: MediaStreamTrack, stream: MediaStream) {
    track.stop();
    console.log("peer: track: Removing track");
    stream.removeTrack(track);
    this.localStream.removeTrack(track);

    //TODO right place for this function
    //this.updateTracksForPeers();
    this.removeTrackFromPeers(track);
  }


  /*
      Peer Offers + Answers messages
   */
  private async onPeerOfferForward(e: PeerOfferForward, c: WebSocketServerConnection) {
    console.log("peer: Peer wants to connect")
    const otherClient = this.peers.find(p => p.client.id == e.clientFrom);
    if (otherClient == undefined) {
      console.warn("peer: Could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client. known clients are " + JSON.stringify(c.clients))
      return;
    }
    otherClient.state = PeerConnectionState.Answered;
    await otherClient.connection.setRemoteDescription(e.offer);
    const answer = await otherClient.connection.createAnswer();
    await otherClient.connection.setLocalDescription(answer);
    console.log("peer: sending answer")
    this.webSocketService.send(c, {
      answer: answer,
      type: PeerAnswer.TypeEnum.PeerAnswer,
      clientTo: otherClient.client.id
    } as PeerAnswer)
  }

  private async onPeerAnswerForward(e: PeerAnswerForward, c: WebSocketServerConnection) {
    console.log("peer: Peer did send answer")
    const peer = this.peers.find(p => p.client.id == e.clientFrom);
    if (peer == undefined) {
      console.warn("peer: Could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client")
      return;
    }
    try {
      await peer.connection.setRemoteDescription(e.answer);
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
    console.log("peer: " + peer.client.username + " connected");
  }


}

