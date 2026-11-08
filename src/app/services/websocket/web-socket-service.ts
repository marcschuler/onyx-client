import {Injectable, inject} from '@angular/core';
import {
  Client,
  ConnectionState,
  KeyId,
  mapToChannel,
  mapToSection,
  ServerObjectId,
  WebSocketServerConnection
} from './WebSocketServerConnection';
import {Identity} from '../identity-service';
import {ServerDetails} from '../server-loader-service';
import {CryptoService} from '../crypto-service';
import {ToastService, ToastType} from '../ui/toast-service';
import {PeerConnectionService} from '../peer/peer-connection-service';
import {
  AuthChallengeProof,
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthSuccessMessage, ChannelChangeEvent, ChannelCreateEvent,
  ChannelDTO,
  ChannelMoveEvent,
  ClientChangeEvent,
  ClientChannelJoinEvent,
  ClientChannelLeaveEvent,
  ClientKickEvent,
  ClientServerJoinEvent,
  ClientServerLeaveEvent, GameIntegrationRequest, GameIntegrationUpdate,
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
import {RestService} from '../rest/rest-service';
import {reorderListItem, replaceInList} from '../Util';
import {EventHandler} from '../../util';
import {StorageService} from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private cryptoService = inject(CryptoService);
  private toastService = inject(ToastService);
  private restService = inject(RestService);
  private peerConnectionService = inject(PeerConnectionService);
  private storageService = inject(StorageService);


  LOG_MESSAGES = false;

  connection: WebSocketServerConnection | undefined;

  //TODO move to connection.messageHandlers to make it independent of the connection
  private messageHandlers = new Map<MessageTypes, MessageHandler<any>[]>();

  public onServerClose: EventHandler<void> = new EventHandler();

  // sockets closed on purpose by the user (closeConnection) - their close is not reported as an error
  private intentionallyClosed = new WeakSet<WebSocket>();

  constructor() {
    this.addHandler(AuthChallengeRequest.TypeEnum.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(AuthSuccessMessage.TypeEnum.AuthSuccessMessage, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessMessage, c));
    this.addHandler(ServerTreeChangeMessage.TypeEnum.ServerTreeChangeMessage, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeMessage, c))
    this.addHandler(ServerChangeEvent.TypeEnum.ServerChangeEvent, (e, c) => this.onServerChange(e as ServerChangeEvent, c));

    this.addHandler(ChannelCreateEvent.TypeEnum.ChannelCreateEvent, (e, c) => this.onChannelCreate(e as ChannelCreateEvent, c));
    this.addHandler(SectionCreateEvent.TypeEnum.SectionCreateEvent, (e, c) => this.onSectionCreate(e as SectionCreateEvent, c))
    this.addHandler(SectionMoveEvent.TypeEnum.SectionMoveEvent, (e, c) => this.onSectionMove(e as SectionMoveEvent, c));
    this.addHandler(ChannelMoveEvent.TypeEnum.ChannelMoveEvent, (e, c) => this.onChannelMove(e as ChannelMoveEvent, c));
    this.addHandler(ChannelChangeEvent.TypeEnum.ChannelChangeEvent, (e, c) => this.onChannelChange(e as ChannelChangeEvent, c))

    this.addHandler(ClientServerJoinEvent.TypeEnum.ClientServerJoinEvent, (e, c) => this.onClientServerJoin(e as ClientServerJoinEvent, c));
    this.addHandler(ClientServerLeaveEvent.TypeEnum.ClientServerLeaveEvent, (e, c) => this.onClientServerLeave(e as ClientServerLeaveEvent, c))

    this.addHandler(ClientChannelJoinEvent.TypeEnum.ClientChannelJoinEvent, (e, c) => this.onClientChannelJoinEvent(e as ClientChannelJoinEvent, c))
    this.addHandler(ClientChannelLeaveEvent.TypeEnum.ClientChannelLeaveEvent, (e, c) => this.onClientChannelLeaveEvent(e as ClientChannelLeaveEvent, c));

    this.addHandler(ClientChangeEvent.TypeEnum.ClientChangeEvent, (e, c) => this.onClientChange(e as ClientChangeEvent, c));
    this.addHandler(KickedEvent.TypeEnum.KickedEvent, (e, c) => this.onKickMessage(e as KickedEvent, c));
    this.addHandler(ClientKickEvent.TypeEnum.ClientKickEvent, (e, c) => this.onClientKickedMessage(e as ClientKickEvent, c));

    this.addHandler(IceServerMessage.TypeEnum.IceServerMessage, (e, c) => this.onIceServerData(e as IceServerMessage, c));
    this.addHandler(JwtTokenEvent.TypeEnum.JwtTokenEvent, (e, c) => this.onJwtToken(e as JwtTokenEvent, c));

    this.addHandler(GameIntegrationUpdate.TypeEnum.GameIntegrationUpdate,(e,c)=>this.onGameIntegrationUpdate(e as GameIntegrationUpdate,c))

    // error
    this.addHandler(NoPermissionMessage.TypeEnum.NoPermissionMessage, (e) => this.onErrorNoPermission(e as NoPermissionMessage));
  }


  public connect(serverConnection: ServerDetails, identity: Identity, password: string | undefined, retries = 1): Promise<WebSocketServerConnection> {
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
      var connected = false;
      const webSocket = new WebSocket(url);

      const connection = new WebSocketServerConnection(
        serverConnection,
        identity,
        webSocket,
        password,
        this.restService.createRestConfig(serverConnection.url, undefined)
      );
      const connectTimeout = setTimeout(() => { // websocket gives no timeout on connection so tracing manually
        if (!connected)
          webSocket.close();
      }, 8000);
      let connectionError: string | undefined;
      webSocket.onopen = () => {
        clearTimeout(connectTimeout);
        connected = true;
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

      // onerror is always followed by onclose, so all teardown happens exactly once in here
      webSocket.onclose = () => {
        console.log('ws: Disconnected');
        clearTimeout(connectTimeout);
        connection.state = ConnectionState.CLOSED;
        const error = connectionError ?? "Server closed connection";

        // only clear our state if this socket is still the active one (and not e.g. an old one closing late)
        if (this.connection === connection)
          this.connection = undefined;
        this.peerConnectionService.updatePeerConnections();

        if (this.intentionallyClosed.has(webSocket)) {
          console.log("ws: connection closed by user");
        } else {
          const reason = "Reason: " + error;
          console.warn("ws: server closed connection:" + reason)
          this.toastService.create({
            title: "Server closed connection",
            message: reason,
            type: ToastType.Error,
          })
        }
        reject(error);
        this.onServerClose.emit();
        //TODO recopnnecting does not work, every onServerClose doubles the connections
        // this.connect(serverConnection, identity, retries - 1);
      };
      webSocket.onerror = (error) => {
        console.error('ws: Error on connection', error);
        connection.state = ConnectionState.ERROR;
        connectionError = "Connection error " + error.type;
      };
    });
  }

  closeConnection(connection: WebSocketServerConnection) {
    console.log("ws: closing connection")
    this.intentionallyClosed.add(connection.serverConnection);
    connection.serverConnection.close(); //TODO return a code or something?
    if (this.connection === connection)
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
    for (const [key, handlers] of this.messageHandlers.entries()) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0)
          this.messageHandlers.delete(key);
        break;
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
    // Bind the signature to the origin we connected to, so a malicious server can't relay
    // another server's challenge to us. The origin must come from our own saved server entry,
    // never from anything the server sent. The challenge is copied exactly as received.
    const proof: AuthChallengeProof = {
      type: "onyx-auth",
      challenge: event.challenge.challenge,
      origin: toOrigin(connection.serverConnections.url)
    }
    const signature = await this.cryptoService.sign(proof, connection.identity)

    this.send(connection, {
      username: connection.identity.username,
      publicKey: await this.cryptoService.exportKey(connection.identity.keyPair.publicKey),
      challenge: signature,
      serverPassword: connection.serverPassword,
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
      details: event.me
    }
    connection.addClient(connection.me);
    console.log("ws: onAuthSuccess: we are " + connection.me.id + " / " + connection.me.details.username)

    event.clients.forEach((clientOnline) => {
      const client = clientOnline.user;
      console.log("ws: onAuthSuccess: client already online: " + client.id + " / " + client.username)
      connection.addClient({
        id: client.id as KeyId,
        channel: clientOnline.channelId as (ServerObjectId | undefined),
        details: client
      })
    })

    connection.rest = this.restService.updateRestConfig(connection.rest, event.jwt);

    if (this.storageService.gameIntegration.state.steamId64) {
      this.send(connection, {
        steamId64: this.storageService.gameIntegration.state.steamId64,
        type: "GameIntegrationRequest"
      } as GameIntegrationRequest)
    }

  }

  private async onServerTreeChangeEvent(event: ServerTreeChangeMessage, connection: WebSocketServerConnection) {
    connection.initServerTree(event);
  }

  private onServerChange(event: ServerChangeEvent, connection: WebSocketServerConnection) {
    connection.server.info = event.server;
    console.log("server details changed", event.server)
  }

  private onChannelCreate(event: ChannelCreateEvent, connection: WebSocketServerConnection) {
    connection.section(event.sectionId)?.channels.push(
      mapToChannel({...event.channel, sectionId: event.sectionId}, []) // a new channel has no clients yet
    );
  }

  private onSectionCreate(event: SectionCreateEvent, connection: WebSocketServerConnection) {
    connection.sections.splice(event.order, 0, mapToSection(event.section, [])); // a new section has no clients yet
  }

  private onSectionMove(event: SectionMoveEvent, connection: WebSocketServerConnection) {
    const section = connection.section(event.sectionId);
    if (!section) {
      console.error("ws: onSectionMove: unknown section " + event.sectionId);
      return;
    }
    reorderListItem(connection.sections, section, event.order);
  }

  private onChannelMove(event: ChannelMoveEvent, connection: WebSocketServerConnection) {
    const channel = connection.channel(event.channelId);
    const section = connection.sectionOfChannel(event.channelId);
    const newSection = event.sectionId ? connection.section(event.sectionId) : section;
    if (!channel || !section || !newSection) {
      console.error("ws: onChannelMove: unknown channel or section", event);
      return;
    }
    reorderListItem(section.channels, channel, event.order, newSection.channels);
  }

  private onChannelChange(event: ChannelChangeEvent, connection: WebSocketServerConnection) {
    const channel = connection.channel(event.channel.id);
    const section = connection.sectionOfChannel(event.channel.id);
    if (!channel || !section) {
      console.error("ws: onChannelChange: could not find channel in list", connection.sections, event);
      return;
    }
    replaceInList(section.channels, channel, {...channel, ...event.channel});
  }

  private onIceServerData(event: IceServerMessage, connection: WebSocketServerConnection) {
    console.log("ws: onIceServer: added " + event.iceServers.length + " ice servers");
    connection.config.iceServers = event.iceServers;
  }

  private onClientChannelJoinEvent(event: ClientChannelJoinEvent, connection: WebSocketServerConnection) {
    const client = connection.client(event.userId);
    if (!client) {
      console.error("ws: onClientChannelJoin: unknown client " + event.userId);
      return;
    }
    console.log("ws: onClientChannelJoin: Client " + client.details.username + " changed channel to " + event.channelId)
    connection.moveClient(client, event.channelId as ServerObjectId);
    if (client == connection.me) {
      console.log("ws: onClientChannelJoin: Our channel changed to " + client.channel)
    }
    this.peerConnectionService.updatePeerConnections();
  }


  private onClientChannelLeaveEvent(event: ClientChannelLeaveEvent, connection: WebSocketServerConnection) {
    const client = connection.client(event.userId);
    if (!client) {
      console.error("ws: onClientChannelLeave: unknown client " + event.userId);
      return;
    }
    console.log("ws: onClientChannelLeave: Client " + client.details.username + " left the channel")
    connection.moveClient(client, undefined);

    if (client == connection.me) {
      console.log("ws: onClientChannelLeave: Left our channel")
    }

    this.peerConnectionService.updatePeerConnections();
  }

  private onClientChange(event: ClientChangeEvent, connection: WebSocketServerConnection) {
    console.log("ws: onClientChange: Details for client changed", event.user)
    const client = connection.client(event.user.id);
    if (!client) {
      console.error("ws: onClientChange: unknown client " + event.user.id);
      return;
    }
    client.details = event.user;
  }

  private onGameIntegrationUpdate(event: GameIntegrationUpdate, connection: WebSocketServerConnection) {
    //TODO
  }

  private onKickMessage(event: KickedEvent, connection: WebSocketServerConnection) {
    let message;
    switch (event.reason) {
      case "ALREADY_CONNECTED":
        message = "You are already connected with this identity";
        break;
      case "UNAUTHORIZED_REQUEST":
          message = "You made an unauthorized request";
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
    const client: Client = {
      id: event.user.id as KeyId,
      channel: undefined,
      details: event.user
    };
    connection.addClient(client)
    console.log("Client " + client.id + " joined the server")
  }

  private onClientServerLeave(event: ClientServerLeaveEvent, connection: WebSocketServerConnection) {
    if (!connection.removeClient(event.userId)) {
      console.error("WS: ClientLeaveEvent: Client " + event.userId + " disconnected but could not find client");
      return;
    }
    console.log("Client " + event.userId + " has left the server");
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

/**
 * Reduces a saved server URL to scheme://host[:port] for the auth proof.
 * The server ignores paths and treats ws/wss like http/https, so this is just for tidiness.
 */
function toOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
