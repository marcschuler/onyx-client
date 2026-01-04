import {Identity} from '../identity-service';
import {IceServer, SectionDTO} from '../../../api/webrtc-server';

export interface WebSocketServerConnection {
  state: ConnectionState; // the current state of connection
  identity: Identity; // the used identity
  jwt?: string;
  serverConnection: WebSocket; // the websocket connection

  data?: ServerTree; //the server tree
  config: ServerConfig; //configuration settings for this server
  clients: Client[]; //all clients
  currentChannel?: ServerObjectId | undefined; //the current channel if existing
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
  sections: SectionDTO[];
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


type Brand<K, T> = K & { __brand: T };

// The ID all server objects use, may be a UUID
export type ServerObjectId = Brand<string, "ServerObjectId">;
// The ID of a key
export type KeyId = Brand<string, "KeyId">;
