import {Injectable, inject} from '@angular/core';
import {Client, ConnectionState, KeyId, ServerObjectId, WebSocketServerConnection} from './WebSocketServerConnection';
import {Identity} from '../identity-service';
import {ServerConnection} from '../server-loader-service';
import {CryptoService} from '../crypto-service';
import {ToastService, ToastType} from '../ui/toast-service';
import {PeerConnectionService} from '../peer/peer-connection-service';
import {
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthSuccessMessage, ChannelCreateEvent,
  ChannelDTO,
  ChannelMoveEvent,
  ClientChangeEvent,
  ClientChannelJoinEvent,
  ClientChannelLeaveEvent,
  ClientKickEvent,
  ClientServerJoinEvent,
  ClientServerLeaveEvent,
  IceServerMessage,
  JwtTokenEvent,
  KickedEvent,
  MessageTypes,
  NoPermissionMessage,
  SectionCreateEvent,
  SectionDTO,
  SectionExtendedDTO,
  SectionMoveEvent,
  ServerChangeEvent,
  ServerTreeChangeMessage
} from '../../../api/onyx-server';
import {RestService} from '../rest-service';
import {clientWithId, getChannelFromId, getSectionFromId, getSectionOfChannel, reorderListItem} from '../Util';
import {EventHandler} from '../../util';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private cryptoService = inject(CryptoService);
  private toastService = inject(ToastService);
  private restService = inject(RestService);
  private peerConnectionService = inject(PeerConnectionService);


  LOG_MESSAGES = false;

  connection: WebSocketServerConnection | undefined;

  //TODO move to connection.messageHandlers to make it independent of the connection
  private messageHandlers = new Map<MessageTypes, MessageHandler<any>[]>();

  public onServerClose: EventHandler<void> = new EventHandler();

  constructor() {
    this.addHandler(AuthChallengeRequest.TypeEnum.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(AuthSuccessMessage.TypeEnum.AuthSuccessMessage, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessMessage, c));
    this.addHandler(ServerTreeChangeMessage.TypeEnum.ServerTreeChangeMessage, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeMessage, c))
    this.addHandler(ServerChangeEvent.TypeEnum.ServerChangeEvent, (e, c) => this.onServerChange(e as ServerChangeEvent, c));

    this.addHandler(ChannelCreateEvent.TypeEnum.ChannelCreateEvent, (e, c) => this.onChannelCreate(e as ChannelCreateEvent, c));
    this.addHandler(SectionCreateEvent.TypeEnum.SectionCreateEvent, (e, c) => this.onSectionCreate(e as SectionCreateEvent, c))
    this.addHandler(SectionMoveEvent.TypeEnum.SectionMoveEvent, (e, c) => this.onSectionMove(e as SectionMoveEvent, c));
    this.addHandler(ChannelMoveEvent.TypeEnum.ChannelMoveEvent, (e, c) => this.onChannelMove(e as ChannelMoveEvent, c));

    this.addHandler(ClientServerJoinEvent.TypeEnum.ClientServerJoinEvent, (e, c) => this.onClientServerJoin(e as ClientServerJoinEvent, c));
    this.addHandler(ClientServerLeaveEvent.TypeEnum.ClientServerLeaveEvent, (e, c) => this.onClientServerLeave(e as ClientServerLeaveEvent, c))

    this.addHandler(ClientChannelJoinEvent.TypeEnum.ClientChannelJoinEvent, (e, c) => this.onClientChannelJoinEvent(e as ClientChannelJoinEvent, c))
    this.addHandler(ClientChannelLeaveEvent.TypeEnum.ClientChannelLeaveEvent, (e, c) => this.onClientChannelLeaveEvent(e as ClientChannelLeaveEvent, c));

    this.addHandler(ClientChangeEvent.TypeEnum.ClientChangeEvent, (e, c) => this.onClientChange(e as ClientChangeEvent, c));
    this.addHandler(KickedEvent.TypeEnum.KickedEvent, (e) => this.onKickMessage(e as KickedEvent));
    this.addHandler(ClientKickEvent.TypeEnum.ClientKickEvent, (e, c) => this.onClientKickedMessage(e as ClientKickEvent, c));

    this.addHandler(IceServerMessage.TypeEnum.IceServerMessage, (e, c) => this.onIceServerData(e as IceServerMessage, c));
    this.addHandler(JwtTokenEvent.TypeEnum.JwtTokenEvent, (e, c) => this.onJwtToken(e as JwtTokenEvent, c));

    // error
    this.addHandler(NoPermissionMessage.TypeEnum.NoPermissionMessage, (e) => this.onErrorNoPermission(e as NoPermissionMessage));
  }


  public connect(serverConnection: ServerConnection, identity: Identity, retries = 1): Promise<WebSocketServerConnection> {
    if (retries < 0) {
      console.log("ws: no retries, disconnecting");
      if (this.connection)
        this.connection.serverConnection.close();
      this.connection = undefined;
      return Promise.reject("No more retries");
    }
    return new Promise((resolve, reject) => {
      let url = serverConnection.url;
      url = url.replace("http://", "ws://")
        .replace("https://", "wss://");
      url += "/websocket";

      console.log("ws: Connecting to " + url)
      const webSocket = new WebSocket(url);

      const connection: WebSocketServerConnection = {
        serverConnections: serverConnection,
        state: ConnectionState.CONNECTING,
        serverConnection: webSocket,
        identity: identity,
        clients: [],
        config: {},
        me: undefined as any as Client, // is hacky but the server promises to return a result
        rest: this.restService.createRestConfig(serverConnection.url, undefined)
      }
      webSocket.onopen = () => {
        console.log("ws: connected to server")
        retries = 4;
        resolve(connection);
      };
      webSocket.onmessage = (event) => {
        if (this.LOG_MESSAGES)
          console.log('ws: message from server: ', event.data);
        const data: MessageBody = JSON.parse(event.data);
        this.handleEvent(connection, data)
          .catch(e => console.error(e));
      };

      const onServerClose = (error: string) => {
        this.peerConnectionService.updatePeerConnections();
        // setTimeout(() => {
        const reason = "Reason: " + error;
        console.warn("ws: server closed connection:" + reason)
        this.toastService.create({
          title: "Server closed connection",
          message: reason,
          type: ToastType.Error,
        })
        reject(error);
        this.connection = undefined;
        this.onServerClose.emit();
        //TODO recopnnecting does not work, every onServerClose doubles the connections
        // this.connect(serverConnection, identity, retries - 1);
        // }, 4000);
      }

      webSocket.onclose = () => {
        console.log('ws: Disconnected');
        connection.state = ConnectionState.CLOSED;
        onServerClose("Server closed connection");

      };
      webSocket.onerror = (error) => {
        console.error('ws: Error on connection', error);
        //TODO is connection closed? What is the state?
        connection.state = ConnectionState.ERROR;
        onServerClose("Connection error " + error.type);
      };
    });
  }

  closeConnection(connection: WebSocketServerConnection) {
    console.log("ws: closing connection")
    connection.serverConnection.close(); //TODO return a code or something?
    this.connection = undefined;
  }

  public send(connection: WebSocketServerConnection, event: MessageBody) {
    if (this.LOG_MESSAGES)
      console.log("ws: sending data: " + JSON.stringify(event))
    connection.serverConnection.send(JSON.stringify(event));
  }

  public addHandler<T extends MessageBody>(t: MessageTypes, handler: MessageHandler<T>) {
    if (this.messageHandlers.get(t))
      console.warn("Message handler for " + t + " already exists, overwrite...")
    const values = this.messageHandlers.get(t) || [];
    values.push(handler);
    this.messageHandlers.set(t, values);
    return handler;
  }

  removeHandler<T extends MessageBody>(handler: MessageHandler<T>) {
    for (const [key, value] of this.messageHandlers.entries()) {
      for (const v of value) {
        if (v === handler) {
          this.messageHandlers.delete(key);
          break;
        }
      }
    }
  }

  public async handleEvent(connection: WebSocketServerConnection, event: MessageBody) {
    const handler = this.messageHandlers.get(event.type as MessageTypes);
    if (!handler || handler.length == 0) {
      console.warn("No handler for message of type " + event.type + " exists. Ignoring");
      console.warn("Message was: " + JSON.stringify(event));
    } else {
      for (const h of handler) {
        try {
          h(event, connection);
        } catch (e) {
          console.error("Event Handler threw exception", e)
        }
      }
    }
  }

  private async onAuthChallengeRequest(event: AuthChallengeRequest, connection: WebSocketServerConnection) {
    connection.state = ConnectionState.AUTHENTICATING;
    const challenge = event.challenge
    const signature = await this.cryptoService.sign(challenge, connection.identity)

    this.send(connection, {
      username: connection.identity.username,
      publicKey: await this.cryptoService.exportKey(connection.identity.keyPair.publicKey),
      challenge: signature,
      type: AuthChallengeResponse.TypeEnum.AuthChallengeResponse
    } as AuthChallengeResponse)
  }

  private async onAuthSuccessEvent(event: AuthSuccessMessage, connection: WebSocketServerConnection) {
    console.log("ws: onAuthSuccess: server did welcome us - auth successfully")
    connection.state = ConnectionState.CONNECTED;
    this.connection = connection;
    connection.me = {
      id: event.me.id as KeyId,
      channel: undefined,
      username: event.me.username,
      publicKey: event.me.publicKey,
      details: event.me
    }
    this.addClient(connection, connection.me);
    console.log("ws: onAuthSuccess: we are " + connection.me.id + " / " + connection.me.username)

    event.clients.forEach((clientOnline) => {
      const client = clientOnline.user;
      console.log("ws: onAuthSuccess: client already online: " + client.id + " / " + client.username)
      this.addClient(connection, {
        id: client.id as KeyId,
        channel: clientOnline.channelId as (ServerObjectId | undefined),
        username: client.username,
        publicKey: client.publicKey,
        details: client
      })
    })

    connection.rest = this.restService.updateRestConfig(connection.rest, event.jwt);
  }

  private addClient(connection: WebSocketServerConnection, client: Client) {
    if (clientWithId(connection.clients, client.id)) {
      console.error("client with id " + client.id + " already exists");
      return;
    }
    connection.clients.push(client);
  }

  private async onServerTreeChangeEvent(event: ServerTreeChangeMessage, connection: WebSocketServerConnection) {
    connection.data = event;
  }

  private onServerChange(event: ServerChangeEvent, connection: WebSocketServerConnection) {
    connection.data!.server = event.server;
    console.log("server details changed", event.server)
  }

  private onChannelCreate(event: ChannelCreateEvent, connection: WebSocketServerConnection) {
    const channel = event.channel;
    const sectionId = event.sectionId;
    getSectionFromId(sectionId, connection.data!.sections)?.channels.push({
      id: channel.id,
      chatId: channel.chatId,
      sectionId: sectionId,
      name: channel.name,
      order: channel.order,
      users: []
    });
  }

  private onSectionCreate(event: SectionCreateEvent, connection: WebSocketServerConnection) {
    const section = event.section;
    connection.data!.sections.splice(event.order, 0, section);
  }

  private onSectionMove(event: SectionMoveEvent, connection: WebSocketServerConnection) {
    const section = getSectionFromId(event.sectionId, connection.data!.sections) as SectionExtendedDTO;
    reorderListItem(connection.data!.sections, section, event.order);
  }

  private onChannelMove(event: ChannelMoveEvent, connection: WebSocketServerConnection) {
    const channel = getChannelFromId(event.channelId, connection.data!.sections) as ChannelDTO;
    const section = getSectionOfChannel(channel, connection.data!.sections) as SectionDTO;
    const newSection = event.sectionId
      ? getSectionFromId(event.sectionId, connection.data!.sections) as SectionDTO
      : section;
    reorderListItem(section.channels, channel, event.order, newSection.channels);
  }

  private onIceServerData(event: IceServerMessage, connection: WebSocketServerConnection) {
    console.log("ws: onIceServer: added " + event.iceServers.length + " ice servers");
    connection.config.iceServers = event.iceServers;
  }

  private onClientChannelJoinEvent(event: ClientChannelJoinEvent, connection: WebSocketServerConnection) {
    const client = clientWithId(connection.clients, event.userId);
    console.log("ws: onClientChannelJoin: Client " + client.username + " changed channel to " + event.channelId)
    client.channel = event.channelId as ServerObjectId;
    if (client == connection.me) {
      console.log("ws: onClientChannelJoin: Our channel changed to " + client.channel)
    }
    this.peerConnectionService.updatePeerConnections();
  }


  private onClientChannelLeaveEvent(event: ClientChannelLeaveEvent, connection: WebSocketServerConnection) {
    const client = clientWithId(connection.clients, event.userId);
    console.log("ws: onClientChannelLeave: Client " + client.username + " left the channel")
    client.channel = undefined;

    if (client == connection.me) {
      console.log("ws: onClientChannelLeave: Left our channel")
    }

    this.peerConnectionService.updatePeerConnections();
  }

  private onClientChange(event: ClientChangeEvent, connection: WebSocketServerConnection) {
    console.log("ws: onClientChange: Details for client changed", event.user)
    const client = clientWithId(connection.clients, event.user.id);
    client.details = event.user;
  }

  private onKickMessage(event: KickedEvent) {
    let message;
    switch (event.reason) {
      case "ALREADY_CONNECTED":
        message = "You are already connected with this identity";
        break;
      case "UNAUTHORIZED_REQUEST":
        message = "You made an unauthoirzed request";
        break;
      case "INTERNAL_ERROR":
        message = "Internal server error";
        break;
      case "BANNED":
        message = "You were banned from the server";
        break;
      default:
        message = "Unknown reason: " + event.reason;
        break;
    }
    if (event.message)
      message = event.message + " (" + message + ")";
    console.log("You have been kicked. Reason: " + event.reason + ", Message: " + event.message)
    this.toastService.create({
      type: ToastType.Error,
      title: "Kicked from Server",
      message: message,
    })
  }

  private onClientKickedMessage(event: ClientKickEvent, connection: WebSocketServerConnection) {
    console.log("Client " + event.userId + " has been kicked. Reason: " + event.reason + ", Message: " + event.message);
    this.onClientServerLeave({
      userId: event.userId,
      type: "ClientServerLeaveEvent"
    }, connection)
  }

  private onJwtToken(event: JwtTokenEvent, connection: WebSocketServerConnection) {
    connection.rest = this.restService.updateRestConfig(connection.rest, event.jwt);
    console.log("ws: onJwtToken: Received a new JWT token");
  }


  private onClientServerJoin(event: ClientServerJoinEvent, connection: WebSocketServerConnection) {
    const client = {
      id: event.user.id as KeyId,
      username: event.user.username,
      publicKey: event.user.publicKey,
      channel: undefined,
      details: event.user
    };
    this.addClient(connection, client)
    console.log("Client " + client.id + " joined the server")
  }

  private onClientServerLeave(event: ClientServerLeaveEvent, connection: WebSocketServerConnection) {
    const index = connection.clients.findIndex(client => client.id == event.userId);
    if (index == -1) {
      console.error("WS: ClientLeaveEvent: Client " + event.userId + " disconnected but could not find client");
      return;
    }
    console.log("Client " + event.userId + " has left the server");
    connection.clients.splice(index, 1);
  }

  private onErrorNoPermission(event: NoPermissionMessage) {
    console.log("No permission for action", event);
    this.toastService.create({
      title: event.message ? event.message : "No Permission",
      message: "You don't have permission for " + event.permissionType,
      type: ToastType.Warning
    });
  }

}

export type MessageHandler<T extends MessageBody> = (event: T, connection: WebSocketServerConnection) => void | any;

export interface MessageBody {
  type: MessageTypes
}
