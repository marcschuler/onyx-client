import {Injectable, Injector} from '@angular/core';
import {MediaConnection, PeerConnection, PeerConnectionState} from './PeerConnection';
import {Client, ConnectionState, WebSocketServerConnection} from '../websocket/WebSocketServerConnection';
import {WebSocketService} from '../websocket/web-socket-service';
import {CryptoService} from '../crypto-service';
import {ToastMessage, ToastService, ToastType} from '../toast-service';
import {PeerAnswer, PeerAnswerForward, PeerOffer, PeerOfferForward} from '../../../api/webrtc-server';
import {
  NOTIFICATION_USER_JOINED_CHANNEL,
  NOTIFICATION_USER_LEFT_CHANNEL,
  NotificationService
} from '../notification.service';

@Injectable({
  providedIn: 'root'
})
export class PeerConnectionService {

  peers: PeerConnection[] = [];

  localStream: MediaStream = new MediaStream();

  localFakePeer: MediaConnection | undefined;

  //TODO remake as localSourceShared:TrackStatus={} ?
  microphoneShared: MediaStream | undefined;
  cameraShared: MediaStream | undefined;
  screenShared: MediaStream | undefined;

  private webSocketService!: WebSocketService;

  constructor(private injector: Injector,
              private cryptoService: CryptoService,
              private notificationService: NotificationService,
              private toastService: ToastService) {
    setTimeout(() => {
      this.webSocketService = injector.get(WebSocketService);
      this.webSocketService.addHandler(PeerOfferForward.TypeEnum.PeerOfferForward, (e, c) => this.onPeerOfferForward(e as PeerOfferForward, c))
      this.webSocketService.addHandler(PeerAnswerForward.TypeEnum.PeerAnswerForward, (e, c) => this.onPeerAnswerForward(e as PeerAnswerForward, c))
    }, 50);
  }

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
    const otherClient = this.peers.find(p => p.client.id == e.clientFrom);
    if (otherClient == undefined) {
      console.warn("peer: Could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client")
      return;
    }
    await otherClient.connection.setRemoteDescription(e.answer);
    otherClient.state = PeerConnectionState.Connected;
  }

  /**
   * Updates the connection by adding or removing clients
   * so only connections are available that we only connect
   * to clients in our channel
   * @param clients
   */
  public updatePeerConnections() {
    if (!this.webSocketService.connection //no connection (anymore)
      || this.webSocketService.connection.state !== ConnectionState.CONNECTED) { //not in connected state
      console.log("peer: removing all connections because we are not connected to any server")
      this.peers.forEach(p => this.disconnect(p))
      return;
    }

    const clientsInChannel = new Set(this.webSocketService.connection.clients
      .filter(c => c.channel == this.webSocketService.connection?.currentChannel) //only in same channel
      .filter(c => c.id !== this.webSocketService.connection?.identity.id) //remove me
    );
    const clientsConnected = new Set(this.peers.map(peer => peer.client));

    const clientsInChannelThatShouldConnect = [...clientsInChannel].filter(item => !clientsConnected.has(item));
    const clientsConnectedThatAreNotInChannel = [...clientsConnected].filter(item => !clientsInChannel.has(item));

    console.log("peer: updating connections. " + clientsConnectedThatAreNotInChannel + " to delete and " + clientsInChannelThatShouldConnect + " to add")

    clientsInChannelThatShouldConnect.forEach(client => this.connect(client));

    clientsConnectedThatAreNotInChannel.forEach(client => {
      this.peers.filter(p => p.client === client)
        .forEach(p => this.disconnect(p))
    })
  }


  public async connect(client: Client): Promise<PeerConnection> {
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
      tracks: new Map()
    }
    this.setTracks(peer);
    this.peers.push(peer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("peer: sending ice data");
      }
    };
    pc.oniceconnectionstatechange = (event) => {
      console.log("peer: ice: connection state has changed to " + pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed') {
        this.negotiate(peer);
      }
    }

    pc.ondatachannel = (event) => {
      console.log("peer: data channel is active: " + event.type);
    }

    pc.onsignalingstatechange = () => {
      console.log("peer: signaling state change to " + pc.signalingState);
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
          break;

      }
    }

    pc.ontrack = event => {
      console.log("peer: got new tracks");
      if (event.streams.length != 1)
        console.warn("peer: Expected 1 stream, got " + event.streams.length)
      if (peer.stream)
        console.warn("Already have a stream: " + peer.stream);
      peer.stream = event.streams[0];
    }
    console.log("peer: setup clear, waiting for ice config");

    if (this.shouldConnectAsNicePeer(peer)) {
      this.negotiate(peer)
    } else {
      console.log("peer: waiting for " + peer.client.id + " to connect (wait mode)")
    }
    this.notificationService.notify(NOTIFICATION_USER_JOINED_CHANNEL);

    return peer;

  }

  /**
   * Should be called (1) on start of connection
   * (2) when a new track is added
   * @param peer
   */
  public async negotiate(peer: PeerConnection) {
    const pc = peer.connection;
    if (peer.state == PeerConnectionState.Connected)
      console.log("peer: renegotiating...");
    console.log("peer: connecting to " + peer.client.id + " (nice mode)")
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

  public disconnect(peer: PeerConnection) {
    console.log("peer: disconnecting peer " + peer.client.username)
    this.peers.splice(this.peers.indexOf(peer), 1);
    peer.connection.close();
    this.notificationService.notify(NOTIFICATION_USER_LEFT_CHANNEL);
  }

  /**
   * As only one peer should connect to the other and not
   * both at the same time, the one with the higher ID
   * is responsible for connecting
   * @param peer
   */
  public shouldConnectAsNicePeer(peer: PeerConnection): boolean {
    if (!this.webSocketService.connection) {
      console.warn("peer: cannot compare peer niceness - no connection")
      return false;
    }
    return peer.client.id > this.webSocketService.connection.identity.id;
  }

  public async changeTrack(type: TrackType) {
    switch (type) {
      case TrackType.Microphone:
        if (this.microphoneShared) {
          await this.stopTrack(type);
        } else {
          await this.startTrack(type);
        }
        break;
      case TrackType.Camera:
        if (this.microphoneShared) {
          await this.stopTrack(type);
        } else {
          await this.startTrack(type);
        }
        break;
      case TrackType.Screen:
        if (this.microphoneShared) {
          await this.stopTrack(type);
        } else {
          await this.startTrack(type);
        }
        break;
    }
  }


  public async startTrack(type: TrackType) {
    console.log("peer: requesting track " + type)
    var streamPromise: Promise<MediaStream>;
    var alreadySharedError: ToastMessage = {
      title: type + " is already shared",
      type: ToastType.Error,
      message: 'If the error persists, reload the page'
    }
    switch (type) {
      case TrackType.Microphone:
        if (this.microphoneShared) {
          this.toastService.create(alreadySharedError);
          return;
        }
        streamPromise = navigator.mediaDevices.getUserMedia({audio: true})
        break;
      case TrackType.Camera:
        if (this.cameraShared) {
          this.toastService.create(alreadySharedError);
          return;
        }
        streamPromise = navigator.mediaDevices.getUserMedia({video: true})
        break;
      case TrackType.Screen:
        if (this.screenShared) {
          this.toastService.create(alreadySharedError);
          return;
        }
        streamPromise = navigator.mediaDevices.getDisplayMedia({video: true})
        break;
    }

    try {
      console.log("peer: Waiting for answer for track")
      const stream = await streamPromise;
      switch (type) {
        case TrackType.Microphone:
          this.microphoneShared = stream;
          break;
        case TrackType.Camera:
          this.cameraShared = stream;
          break;
        case TrackType.Screen:
          this.screenShared = stream;
          break;
      }
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
        duration: 5000
      })
    }
  }

  public async stopTrack(type: TrackType) {
    console.log("deactivating stream " + type)
    switch (type) {
      case TrackType.Microphone:
        this.stopTracks(this.microphoneShared!);
        this.microphoneShared = undefined;
        break;
      case TrackType.Camera:
        this.stopTracks(this.cameraShared!);
        this.cameraShared = undefined;
        break;
      case TrackType.Screen:
        this.stopTracks(this.screenShared!);
        this.screenShared = undefined;
        break;
    }

  }

  private stopTracks(stream: MediaStream | undefined) {
    if (!stream) {
      this.toastService.create({
        title: 'Cannot deactivate stream',
        message: 'The stream is not active',
        type: ToastType.Error,
      })
      return;
    }
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }


  // Only set on start, never when adding or removing inputs
  public setTracks(peer: PeerConnection) {
    if (this.localStream.getTracks().length > 0) {
      console.log("peer: adding " + this.localStream.getTracks().length + " tracks to new peer");
    }
    this.localStream.getTracks().forEach(track => {
      peer.connection.addTrack(track);
    })
  }

  private addTrackToPeers(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      console.log("peer: (" + peer.client.username + ") gets new track")
      const sender = peer.connection.addTrack(track, this.localStream);
      if (peer.tracks.has(track))
        console.warn("peer: track: sender already exists for track")
      peer.tracks.set(track, sender);
      this.negotiate(peer);
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
    if (this.localStream.getTracks().length == 0)
      if (this.microphoneShared && this.microphoneShared.getTracks().length == 0)
        this.microphoneShared = undefined;
    if (this.cameraShared && this.cameraShared.getTracks().length == 0)
      this.cameraShared = undefined;
    if (this.screenShared && this.screenShared.getTracks().length == 0)
      this.screenShared = undefined;
    this.removeTrackFromPeers(track);
  }

  private removeTrackFromPeers(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      var sender = peer.tracks.get(track);
      if (!sender) {
        console.warn("peer: track: peer has no track to remove. Does track exist? " + peer.tracks.has(track))
        return;
      }
      peer.connection.removeTrack(sender);
      peer.tracks.delete(track);
      this.negotiate(peer);
    });
  }


}


export enum TrackType {
  Microphone = "Microphone",
  Camera = "Camera",
  Screen = "Screen"
}

type TrackStatus = {
  [K in TrackType]?: MediaStream | undefined;
};
