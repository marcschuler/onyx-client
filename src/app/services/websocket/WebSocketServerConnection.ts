import {Identity} from '../identity-service';
import {IceServer, KeyId, ServerObjectId} from './WebSocketEvents';

export interface WebSocketServerConnection {
  state: ConnectionState;
  identity: Identity;

  serverConnection: WebSocket;

  data?: ServerTree;
  config: ServerConfig;
  clients: Client[];
  currentChannel?: ServerObjectId | undefined;
}

export interface Client{
  id: KeyId;
  publicKey: JsonWebKey;
  username: string;
  channel: ServerObjectId;
}

export interface ServerConfig{
  iceServers?: IceServer[];
}

export interface ServerTree {
  name: string;
  sections: Section[];
}

export interface Section {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
}


export enum ConnectionState {
  CONNECTING = "CONNECTING",
  AUTHENTICATING = "AUTHENTICATING",
  CONNECTED = "CONNECTED",
  CLOSED = "CLOSED",
  ERROR = "ERROR",

}
