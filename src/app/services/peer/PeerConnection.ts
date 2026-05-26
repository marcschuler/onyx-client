import {Client} from '../websocket/WebSocketServerConnection';

export interface PeerConnection extends MediaConnection {
  connection: RTCPeerConnection; // underlaying RTC connection
  state: PeerConnectionState; // our connection state
  dataChannel: RTCDataChannel; //the data channel for further communication

  securityState: SecurityState;
}

export interface MediaConnection {
  client: Client;
  stream?: MediaStream;
}

// Connection states. The first are mirrored from webrtc stadnard
export enum PeerConnectionState {
  WaitingForOffer, //waiting when nice client
  Offered, //offered the connection
  Answered,
  Connected,
  Error,
  Closed
}

//TODO verify that the client is who the server proposes they are
export enum SecurityState {
  UNTESTED,
  INVALID,
  SECURE
}
