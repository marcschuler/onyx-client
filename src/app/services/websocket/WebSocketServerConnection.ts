import {Identity} from '../identity-service';

export interface WebSocketServerConnection {
  state: ConnectionState;
  identity: Identity;

  serverConnection: WebSocket;

  data?: ServerTree;
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
