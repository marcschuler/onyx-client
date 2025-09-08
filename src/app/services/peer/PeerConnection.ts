import {Client} from '../websocket/WebSocketServerConnection';

export interface PeerConnection {
  client:Client;
  connection:RTCPeerConnection;
  tracks:MediaStreamTrack[];
}
