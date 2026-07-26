import {Client} from '../websocket/WebSocketServerConnection';


export interface PeerConnection {
  connection: RTCPeerConnection; // underlaying RTC connection
  state: PeerConnectionState; // our connection state

  securityState: SecurityState;

  client: Client;
  streams: PeerStreams;
  dataStream: DataStream;
}

export interface PeerStreams{
  cameraMic?: MediaStream;
  screen?: MediaStream;
  unknownStreams: MediaStream;
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
