import {Injectable, Injector} from '@angular/core';
import {MediaConnection, PeerConnection, PeerConnectionState} from './PeerConnection';
import {Client, ConnectionState, WebSocketServerConnection} from '../websocket/WebSocketServerConnection';
import {WebSocketService} from '../websocket/web-socket-service';
import {CryptoService} from '../crypto-service';
import {EventType, PeerAnswer, PeerAnswerForward, PeerOffer, PeerOfferForward} from '../websocket/WebSocketEvents';
import {ToastService, ToastType} from '../toast-service';

@Injectable({
  providedIn: 'root'
})
export class PeerConnectionService {

  private config = {
    iceServers: [
      {urls: 'stun:stun.l.google.com:19302'}
    ]
  };

  peers: PeerConnection[] = [];

  localStream: MediaStream = new MediaStream();

  localFakePeer:MediaConnection|undefined;

  microhponeShared: boolean = false;
  cameraShared: boolean = false;
  screenShared: boolean = false;

  private webSocketService!: WebSocketService;

  constructor(private injector: Injector,
              private cryptoService: CryptoService,
              private toastService: ToastService) {
    setTimeout(() => {
      this.webSocketService = injector.get(WebSocketService);
      this.webSocketService.addHandler(EventType.PeerOfferForward, (e, c) => this.onPeerOfferForward(e as PeerOfferForward, c))
      this.webSocketService.addHandler(EventType.PeerAnswerForward, (e, c) => this.onPeerAnswerForward(e as PeerAnswerForward, c))
    }, 50);
  }

  private async onPeerOfferForward(e: PeerOfferForward, c: WebSocketServerConnection) {
    console.log("peer: Peer wants to connect")
    const otherClient = this.peers.find(p => p.client.id == e.clientFrom);
    if (otherClient==undefined){
      console.warn("peer: Could not find client " + e.clientFrom + ". This is either bad concurrency or we don't know the client. known clients are " + JSON.stringify(c.clients))
      return;
    }
    otherClient.state = PeerConnectionState.Answered;
    await otherClient.connection.setRemoteDescription(e.offer);
    const answer = await otherClient.connection.createAnswer();
    await otherClient.connection.setLocalDescription(answer);
    console.log("peer: sending answer")
    this.webSocketService.sendToServer(c,{
      answer: answer,
      type: EventType.PeerAnswer,
      clientTo: otherClient.client.id
    } as PeerAnswer)
  }

  private async onPeerAnswerForward(e: PeerAnswerForward, c: WebSocketServerConnection) {
    console.log("peer: Peer did send answer")
    const otherClient = this.peers.find(p => p.client.id == e.clientFrom);
    if (otherClient==undefined){
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
    const pc: RTCPeerConnection = new RTCPeerConnection(this.config);
    const peer: PeerConnection = {
      connection: pc,
      client: client,
      state: PeerConnectionState.WaitingForOffer,
      dataChannel: pc.createDataChannel("data")
    }
    this.setTracks(peer);
    this.peers.push(peer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("peer: sending ice data");
      }
    };

    pc.ondatachannel = (event) => {
      console.log("peer: data channel is active: " + event.type);
    }

    pc.onsignalingstatechange=()=>{
      console.log("peer: signaling state change to " + pc.signalingState);
      switch (pc.signalingState){
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
    return peer;

  }

  /**
   * Should be called (1) on start of connection
   * (2) when a new track is added
   * @param peer
   */
  public async negotiate(peer: PeerConnection) {
    const pc = peer.connection;
    if (peer.state = PeerConnectionState.Connected)
      console.log("peer: renegotiating...");
    console.log("peer: connecting to " + peer.client.id + " (nice mode)")
    const offer = await pc.createOffer({iceRestart:true});
    await pc.setLocalDescription(offer);
    this.webSocketService.sendToServer(this.webSocketService.connection!,
      {
        clientTo: peer.client.id,
        type: EventType.PeerOffer,
        offer: offer
      } as PeerOffer)
    peer.state = PeerConnectionState.Offered;
  }

  public disconnect(peer: PeerConnection) {
    console.log("peer: disconnecting peer " + peer.client.username)
    this.peers.splice(this.peers.indexOf(peer), 1);
    peer.connection.close();
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

  // Only set on start, never when adding or removing inputs
  public setTracks(peer: PeerConnection) {
    this.localStream.getTracks().forEach(track => {
      peer.connection.addTrack(track);
    })
  }

  private addTrackToPeers(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      console.log("peer: (" + peer.client.username + ") gets new track")
      peer.connection.addTrack(track,this.localStream);
      this.negotiate(peer);
    });
  }

  public async startTrack(type: TrackType) {
    console.log("peer: requesting track " + type)
    var streamPromise: Promise<MediaStream>;
    switch (type) {
      case TrackType.Microphone:
        streamPromise = navigator.mediaDevices.getUserMedia({audio: true})
        break;
      case TrackType.Camera:
        streamPromise = navigator.mediaDevices.getUserMedia({video: true})
        break;
      case TrackType.Screen:
        streamPromise = navigator.mediaDevices.getDisplayMedia({video: true})
        break;
    }

    try {
      console.log("peer: Waiting for answer for track")
      const stream = await streamPromise;
      switch (type) {
        case TrackType.Microphone:
          this.microhponeShared = true;
          break;
        case TrackType.Camera:
          this.cameraShared = true;
          break;
        case TrackType.Screen:
          this.screenShared = true;
          break;
      }
      console.log("peer: activated track, adding to locals and "+this.peers.length+" peers")
      stream.getTracks().forEach(track => {
        this.localStream.addTrack(track);
        this.addTrackToPeers(track);
      })

    } catch (e) {
      this.toastService.create({
        title: "Could not open device",
        message: JSON.stringify(e),
        type: ToastType.Error,
        duration: 5000
      })
    }
  }



}


export enum TrackType {
  Microphone,
  Camera,
  Screen
}
