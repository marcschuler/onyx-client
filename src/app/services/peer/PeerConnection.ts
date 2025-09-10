import {Client} from '../websocket/WebSocketServerConnection';

export interface PeerConnection {
  client:Client;
  connection:RTCPeerConnection;
  tracks:MediaStreamTrack[];
  state: PeerConnectionState;
}

export enum PeerConnectionState {
  WaitingForOffer, //waiting when nice client
  Offered, //offered the connection
  Answered,
  Connected,
}
