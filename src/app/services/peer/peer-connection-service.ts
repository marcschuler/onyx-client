import {Injectable} from '@angular/core';
import {PeerConnection} from './PeerConnection';
import {Client} from '../websocket/WebSocketServerConnection';
import {WebSocketService} from '../websocket/web-socket-service';
import {CryptoService} from '../crypto-service';
import {EventType, PeerOfferForward} from '../websocket/WebSocketEvents';

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

  constructor(private webSocketService: WebSocketService,
              private cryptoService: CryptoService) {
  }

  /**
   * Updates the connection by adding or removing clients
   * so only connections are available that we only connect
   * to clients in our channel
   * @param clients
   */
  public updatePeerConnections(clients: Client[]) {
    const clientsInChannel = new Set(clients);
    const clientsConnected = new Set(this.peers.map(peer => peer.client));

    const clientsInChannelThatShouldConnect = [...clientsInChannel].filter(item => !clientsConnected.has(item));
    const clientsConnectedThatAreNotInChannel = [...clientsConnected].filter(item => !clientsInChannel.has(item));

    clientsInChannelThatShouldConnect.forEach(client => this.connect(client));

    clientsConnectedThatAreNotInChannel.forEach(client => {
      this.peers.filter(p => p.client === client)
        .forEach(p => this.disconnect(p))
    })
  }


  public connect(client: Client): PeerConnection {
    console.log("peer: connecting to " + client.username)
    const pc: RTCPeerConnection = new RTCPeerConnection(this.config);
    const peer: PeerConnection = {
      connection: pc,
      client: client,
      tracks: []
    }
    this.setTracks(peer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("peer: sending ice data");
        this.webSocketService.sendToServer(this.webSocketService.connection!,
          {
            client: peer.client.id,
            type: EventType.PeerOfferForward,
            offer: event.candidate
          } as PeerOfferForward)
      }
    };

    pc.ontrack = event => {
      if (event.streams.length != 1)
        console.warn("Expected 1 stream, got " + event.streams.length)
      const [track] = event.streams[0].getTracks();
      peer.tracks.push(track);
    }

    if (this.shouldConnectAsNicePeer(peer)) {
      //TODO connect
    }

    return peer;

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

  public addTracks(tracks: MediaStreamTrack[]) {
    tracks.forEach(track => {
      this.addTrack(track)
    })
  }

  public addTrack(track: MediaStreamTrack) {
    this.peers.forEach(peer => {
      peer.connection.addTrack(track);
    });
  }

  public async startMicrophone() {
    this.start(await navigator.mediaDevices.getUserMedia({audio: true}));
  }

  public async startCamera() {
    this.start(await navigator.mediaDevices.getUserMedia({video: true, audio: true}));
  }

  public async startScreen() {
    this.start(await navigator.mediaDevices.getDisplayMedia({video: true}));
  }

  private start(s: MediaStream) {
    s.getTracks().forEach(t => this.localStream.addTrack(t));
    this.addTracks(s.getTracks())
  }

}
