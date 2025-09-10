import {Injectable} from '@angular/core';
import {Client, ConnectionState, WebSocketServerConnection} from './WebSocketServerConnection';
import {Identity, IdentityService} from '../identity-service';
import {ServerConnection} from '../server-loader-service';
import {CryptoService} from '../crypto-service';
import {
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthSuccessEvent,
  ClientChannelJoinEvent,
  ClientChannelLeaveEvent,
  EventBody,
  EventType,
  ServerTreeChangeEvent
} from './WebSocketEvents';
import {ToastService, ToastType} from '../toast-service';
import {PeerConnectionService} from '../peer/peer-connection-service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  connection: WebSocketServerConnection | undefined;

  private messageHandlers: Map<EventType, MessageHandler<any>> = new Map();

  constructor(private identityService: IdentityService, private cryptoService: CryptoService, private toastService: ToastService,
              private peerConnectionService:PeerConnectionService) {
    this.addHandler(EventType.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(EventType.AuthSuccessEvent, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessEvent, c));
    this.addHandler(EventType.ServerTreeChangeEvent, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeEvent, c))
    this.addHandler(EventType.ClientChannelJoinEvent, (e, c) => this.onClientChannelJoinEvent(e as ClientChannelJoinEvent, c))
    this.addHandler(EventType.ClientChannelLeaveEvent, (e, c) => this.onClientChannelLeaveEvent(e as ClientChannelLeaveEvent, c));
  }


  public connect(serverConnection: ServerConnection, identity: Identity): Promise<WebSocketServerConnection> {
    return new Promise((resolve, reject) => {
      var url = serverConnection.url;
      url = url.replace("http://", "ws://")
        .replace("https://", "ws://");
      url += "/websocket";

      console.log("ws: Connecting to " + url)
      const webSocket = new WebSocket(url);

      const connection: WebSocketServerConnection = {
        state: ConnectionState.CONNECTING,
        serverConnection: webSocket,
        identity: identity,
        clients: []
      }
      webSocket.onopen = (_) => {
        console.log("ws: connected to server")
        resolve(connection);
      };
      webSocket.onmessage = (event) => {
        console.log('ws: message from server: ', event.data);
        const data: EventBody<EventType> = JSON.parse(event.data);
        this.handleEvent(connection, data)
          .catch(e => console.error(e));
      };
      webSocket.onclose = () => {
        console.log('ws: Disconnected');
        connection.state = ConnectionState.CLOSED;
        reject("Connection closed");
        setTimeout(() => { this.connect(serverConnection, identity); }, 2000);
        this.peerConnectionService.updatePeerConnections();
      };
      webSocket.onerror = (error) => {
        console.error('ws: Error on connection', error);
        //TODO is connection closed? What is the state?
        connection.state = ConnectionState.ERROR;
        this.toastService.create({
          title: "Connection lost",
          message: "Trying to reconnect...",
          type: ToastType.Error,
          duration: 3000
        })
        this.peerConnectionService.updatePeerConnections();
        reject(error);
      };
    });

  }

  public sendToServer<T extends EventType>(connection: WebSocketServerConnection, event: EventBody<T>) {
    console.log("ws: sending data: " + JSON.stringify(event))
    connection.serverConnection.send(JSON.stringify(event));
  }

  public addHandler<T extends EventType>(t: EventType, handler: MessageHandler<T>) {
    if (this.messageHandlers.get(t))
      console.warn("Message handler for " + t + " already exists, overwrite...")
    this.messageHandlers.set(t, handler);
  }

  public async handleEvent<T extends EventType>(connection: WebSocketServerConnection, event: EventBody<T>) {
    var handler = this.messageHandlers.get(event.type);
    if (!handler) {
      console.warn("No handler for message of type " + event.type + " exists. Ignoring");
    } else {
      handler(event, connection);
    }
  }

  private async onAuthChallengeRequest(event: AuthChallengeRequest, connection: WebSocketServerConnection) {
    connection.state = ConnectionState.AUTHENTICATING;
    const challenge = event.challenge
    const signature = await this.cryptoService.sign(challenge, connection.identity)

    this.sendToServer(connection, {
      username: connection.identity.username,
      publicKey: await this.cryptoService.exportKey(connection.identity.keyPair.publicKey),
      challenge: signature,
      type: EventType.AuthChallengeResponse
    } as AuthChallengeResponse)
  }

  private async onAuthSuccessEvent(event: AuthSuccessEvent, connection: WebSocketServerConnection) {
    console.log("ws: server did welcome us - auth successfully")
    connection.state = ConnectionState.CONNECTED;
    this.connection = connection;
  }

  private async onServerTreeChangeEvent(event: ServerTreeChangeEvent, connection: WebSocketServerConnection) {
    connection.data = event;
  }

  private onClientChannelJoinEvent(event: ClientChannelJoinEvent, connection: WebSocketServerConnection) {
    const clients = connection.clients.filter(c => event.user.id == c.id);
    let client: Client | undefined;
    if (clients.length == 0) {
      client = {
        id: event.user.id,
        username: event.user.username,
        publicKey: event.user.publicKey,
        channel: event.channelId
      };
      connection.clients.push(client);
    } else {
      client = clients[0];
      client.channel = event.channelId;
    }
    if (this.isMe(client, connection))
      connection.currentChannel = client.channel;

    this.peerConnectionService.updatePeerConnections();
  }


  private onClientChannelLeaveEvent(event: ClientChannelLeaveEvent, connection: WebSocketServerConnection) {
    const clients = connection.clients.filter(c => event.user.id == c.id);
    if (clients.length == 1) {
      const index = connection.clients.indexOf(clients[0]);
      connection.clients.splice(index, 1)
    } else {
      console.error("Could not find client " + event.user + " that did leave the channel");
    }

    this.peerConnectionService.updatePeerConnections();
  }

  public isMe(client: Client, connection: WebSocketServerConnection): Boolean {
    return (client.username == connection.identity.username) //TODO check by key id - this is terrible
  }
}

export type MessageHandler<T extends EventType> = (event: EventBody<T>, connection: WebSocketServerConnection) => void | any;

