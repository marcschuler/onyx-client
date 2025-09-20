import {Client} from '../websocket/WebSocketServerConnection';

export interface PeerConnection extends MediaConnection{
  connection:RTCPeerConnection;
  state: PeerConnectionState;
  dataChannel: RTCDataChannel;

  tracks: Map<MediaStreamTrack,RTCRtpSender>;
}

export interface MediaConnection{
  client:Client;
  stream?:MediaStream;
}

export enum PeerConnectionState {
  WaitingForOffer, //waiting when nice client
  Offered, //offered the connection
  Answered,
  Connected,
  Error,
  Closed
}
