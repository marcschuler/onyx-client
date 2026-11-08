import {Client} from '../websocket/WebSocketServerConnection';


export interface PeerConnection {
  connection: RTCPeerConnection; // underlaying RTC connection
  state: PeerConnectionState; // our connection state

  securityState: SecurityState;

  client: Client;
  streams: PeerStreams;
  dataStream: DataStream;

  makingOffer: boolean; // true while we create and send an offer (used to detect offer collisions)
  answering: boolean; // true while we create and send an answer - no new offer may start meanwhile
  negotiationPending: boolean; // a negotiation was skipped because another one was in progress
}

export interface PeerStreams{
  cameraMic?: MediaStream; // camera + microphone stream
  screen?: MediaStream; // screen stream
  unknownStreams: MediaStream; // streams we don't know where they are belonging to

  talking: boolean;
}

export interface DataStream{
  channel?: RTCDataChannel; //the data channel for further communication
  messageQueue: any[];
}


// Connection states. The first are mirrored from webrtc standard
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
