import {Identity} from '../identity-service';
import {
  ChannelControllerService, ChannelDTO, ChannelExtendedDTO,
  ChatControllerService, Game, GroupControllerService, InviteControllerService, SectionControllerService, SectionDTO,
  SectionExtendedDTO, ServerControllerService, ServerDTO,
  ServerTreeChangeMessage, StorageControllerService, UserControllerService, UserSimpleDTO
} from '../../../api/onyx-server';
import {IceServer} from '../../../api/onyx-server';
import {ServerDetails} from '../server-loader-service';

export class WebSocketServerConnection {
  state: ConnectionState = ConnectionState.CONNECTING; // the current state of connection

  server: Server; //the server tree, empty until the ServerTreeChangeMessage arrived
  config: ServerConfig = {}; //configuration settings for this server

  me!: Client; // set on AuthSuccessMessage, the server promises to send it before anything else

  selectedChannel?: ServerObjectId | undefined; //the selected channel in UI if existing

  constructor(
    public serverConnections: ServerDetails,
    public identity: Identity, // the used identity
    public serverConnection: WebSocket, // the websocket connection
    public serverPassword: string | undefined,
    public rest: RestConfiguration,
  ) {
    this.server = {
      info: {
        id: "",
        name: "",
        settings: {newUsersNeedInvite: false, password: false},
        publicKey: {},
        description: [],
      },
      sections: [],
      idleClients: [],
    };
  }

  /**
   * Initializes the server tree from the server message. The server sends it exactly once per connection.
   * All clients known so far are placed into their channels (clients added before the tree arrived wait in idleClients).
   */
  initServerTree(tree: ServerTreeChangeMessage) {
    this.server = mapToServer(tree, this.clients);
  }

  get sections(): Section[] {
    return this.server.sections;
  }

  section(id: string): Section | undefined {
    return this.sections.find(s => s.id === id);
  }

  channel(id: string): Channel | undefined {
    for (const s of this.sections) {
      const channel = s.channels.find(c => c.id === id);
      if (channel)
        return channel;
    }
    return undefined;
  }

  sectionOfChannel(channelId: string): Section | undefined {
    return this.sections.find(s => s.channels.some(c => c.id === channelId));
  }

  /** the online client with this id, undefined if the client is not online */
  client(id: string): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  /** all online clients - in a channel or idle. Read only, use addClient/removeClient/moveClient to change */
  get clients(): Client[] {
    return this.clientLists().flat();
  }

  /** adds an online client to its channel (or idle if it is in no channel) */
  addClient(client: Client) {
    if (this.client(client.id)) {
      console.error("connection: addClient: client with id " + client.id + " already exists");
      return;
    }
    this.clientList(client.channel).push(client);
  }

  /** removes an online client from the tree, returns the removed client */
  removeClient(id: string): Client | undefined {
    for (const list of this.clientLists()) {
      const index = list.findIndex(c => c.id === id);
      if (index !== -1)
        return list.splice(index, 1)[0];
    }
    return undefined;
  }

  /** moves a client to another channel, undefined moves it to the idle clients */
  moveClient(client: Client, channelId: ServerObjectId | undefined) {
    this.removeClient(client.id);
    client.channel = channelId;
    this.clientList(channelId).push(client);
  }

  private clientLists(): Client[][] {
    return [
      this.server.idleClients,
      ...this.sections.flatMap(s => s.channels).map(c => c.clients),
    ];
  }

  /** the list clients of this channel are kept in. Unknown channels (e.g. tree not received yet) are kept idle */
  private clientList(channelId: ServerObjectId | undefined): Client[] {
    if (channelId === undefined)
      return this.server.idleClients;
    const channel = this.channel(channelId);
    if (!channel)
      console.warn("connection: unknown channel " + channelId + ", keeping client idle");
    return channel ? channel.clients : this.server.idleClients;
  }
}

/**
 * Maps the server tree. Clients are put into the channel they are in, the rest (no or unknown channel) are idle.
 */
export function mapToServer(tree: ServerTreeChangeMessage, clients: Client[]): Server {
  const sections = tree.sections.map(s => mapToSection(s, clients));
  const channelIds = new Set(sections.flatMap(s => s.channels).map(c => c.id));
  return {
    info: tree.server,
    sections: sections,
    idleClients: clients.filter(c => c.channel === undefined || !channelIds.has(c.channel)),
  };
}

export function mapToSection(section: SectionExtendedDTO, clients: Client[]): Section {
  const {channels, ...dto} = section;
  return {
    ...dto,
    channels: channels.map(c => mapToChannel(c, clients)),
  };
}

/**
 * Maps a channel. The clients of the channel are the clients of the given list that are in this channel.
 */
export function mapToChannel(channel: ChannelDTO | ChannelExtendedDTO, clients: Client[]): Channel {
  // strip the server's user list (if sent) - the clients are tracked in Channel.clients
  const {users, ...dto} = channel as ChannelExtendedDTO;
  return {
    ...dto,
    clients: clients.filter(c => c.channel === channel.id),
  };
}

export interface RestConfiguration {
  readonly jwt?: string;
  basePath: string;
  serverController: ServerControllerService;
  channelController: ChannelControllerService;
  chatController: ChatControllerService;
  sectionController: SectionControllerService;
  userController: UserControllerService;
  groupController: GroupControllerService;
  storageController: StorageControllerService;
  inviteController: InviteControllerService;
}

export interface Server{
  info: ServerDTO;
  sections: Section[];
  idleClients: Client[]; // clients that are connected but in no channel
}

export interface Section extends Omit<SectionDTO, 'channels'> {
  channels: Channel[];
}

export interface Channel extends ChannelDTO {
  clients: Client[];
}

/** an online session of a user */
export interface Client {
  id: KeyId;
  channel: ServerObjectId | undefined;
  details: UserSimpleDTO; // username, publicKey, avatar, groups
  game?: Game;
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
