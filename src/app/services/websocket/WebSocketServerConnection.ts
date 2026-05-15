import {Identity} from '../identity-service';
import {
  ChannelControllerService,
  ChatControllerService, GroupControllerService, SectionControllerService,
  ServerControllerService, ServerDescriptionControllerService,
  ServerTreeChangeMessage, StorageControllerService, UserControllerService, UserSimpleDTO
} from '../../../api/webrtc-server';
import {IceServer} from '../../../api/webrtc-server';
import {ServerConnection} from '../server-loader-service';

export interface WebSocketServerConnection {
  serverConnections: ServerConnection;
  state: ConnectionState; // the current state of connection
  identity: Identity; // the used identity
  serverConnection: WebSocket; // the websocket connection

  data?: ServerTreeChangeMessage; //the server tree
  config: ServerConfig; //configuration settings for this server
  clients: Client[]; // a list of all clients on the server

  me: Client;

  selectedChannel?: ServerObjectId | undefined; //the selected channel in UI if existing

  rest: RestConfiguration;
}

export interface RestConfiguration {
  readonly jwt?: string;
  basePath: string;
  serverController: ServerControllerService;
  serverDescriptionController: ServerDescriptionControllerService;
  channelController: ChannelControllerService;
  chatController: ChatControllerService;
  sectionController: SectionControllerService;
  userController: UserControllerService;
  groupController: GroupControllerService;
  storageController: StorageControllerService;
}

export interface Client {
  id: KeyId;
  publicKey: JsonWebKey;
  username: string;
  channel: ServerObjectId | undefined;
  details: UserSimpleDTO;
}

export interface ServerConfig {
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
