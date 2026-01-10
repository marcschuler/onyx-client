import {Identity} from '../identity-service';
import {
  ChatControllerService,
  ServerControllerService,
  ServerTreeChangeMessage
} from '../../../api/webrtc-server';
import {IceServer} from '../../../api/webrtc-server/model/iceServer';

export interface WebSocketServerConnection {
  state: ConnectionState; // the current state of connection
  identity: Identity; // the used identity
  serverConnection: WebSocket; // the websocket connection

  data?: ServerTreeChangeMessage; //the server tree
  config: ServerConfig; //configuration settings for this server
  clients: Client[]; //all clients
  currentChannel?: ServerObjectId | undefined; //the current channel if existing
  selectedChannel?: ServerObjectId| undefined; //the selected channel in UI if existing

  rest: RestConfiguration;
}

export interface RestConfiguration{
  readonly jwt?: string;
  serverController: ServerControllerService;
  chatController: ChatControllerService;
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
