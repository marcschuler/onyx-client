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
  EventBody, EventBodyRequest, EventBodyResponse,
  EventType,
  IceServerData,
  ServerTreeChangeEvent
} from './WebSocketEvents';
import {ToastService, ToastType} from '../toast-service';
import {PeerConnectionService} from '../peer/peer-connection-service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  LOG_MESSAGES: boolean = false;

  connection: WebSocketServerConnection | undefined;

  private messageHandlers: Map<EventType, MessageHandler<any>> = new Map();

  private responseCallbacks: Map<string,ResponseMessageHandler<any>> = new Map();

  constructor(private identityService: IdentityService, private cryptoService: CryptoService, private toastService: ToastService,
              private peerConnectionService: PeerConnectionService) {
    this.addHandler(EventType.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(EventType.AuthSuccessEvent, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessEvent, c));
    this.addHandler(EventType.ServerTreeChangeEvent, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeEvent, c))
    this.addHandler(EventType.ClientChannelJoinEvent, (e, c) => this.onClientChannelJoinEvent(e as ClientChannelJoinEvent, c))
    this.addHandler(EventType.ClientChannelLeaveEvent, (e, c) => this.onClientChannelLeaveEvent(e as ClientChannelLeaveEvent, c));
    this.addHandler(EventType.IceServerData, (e, c) => this.onIceServerData(e as IceServerData, c));
  }


  public connect(serverConnection: ServerConnection, identity: Identity, retries: number = 1): Promise<WebSocketServerConnection> {
    if (retries < 0) {
      console.log("ws: no retries, disconnecting");
      if (this.connection)
        this.connection.serverConnection.close();
      this.connection = undefined;
      return Promise.reject("No more retries");
    }
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
        clients: [],
        config: {}
      }
      webSocket.onopen = (_) => {
        console.log("ws: connected to server")
        retries = 4;
        resolve(connection);
      };
      webSocket.onmessage = (event) => {
        if (this.LOG_MESSAGES)
          console.log('ws: message from server: ', event.data);
        const data: EventBody<EventType> = JSON.parse(event.data);
        this.handleEvent(connection, data)
          .catch(e => console.error(e));
      };

      const reconnect = (error: string)=>{
        console.log("ws: reconnecting");
        this.peerConnectionService.updatePeerConnections();
       // setTimeout(() => {
          this.toastService.create({
            title: "Server connection failed",
            message: error,
            type: ToastType.Error,
          })
        this.connection = undefined;
        reject(error);
          //TODO does not work, every reconnect doubles the connections
          // this.connect(serverConnection, identity, retries - 1);
       // }, 4000);
      }

      webSocket.onclose = () => {
        console.log('ws: Disconnected');
        connection.state = ConnectionState.CLOSED;
        reconnect("Server closed connection");

      };
      webSocket.onerror = (error) => {
        console.error('ws: Error on connection', error);
        //TODO is connection closed? What is the state?
        connection.state = ConnectionState.ERROR;
        reconnect("Connection error " + error.type);
      };
    });
  }



  public sendToServer<T extends EventType>(connection: WebSocketServerConnection, event: EventBody<T>) {
    if (this.LOG_MESSAGES)
      console.log("ws: sending data: " + JSON.stringify(event))
    connection.serverConnection.send(JSON.stringify(event));
  }

  public sendToServerResponse<T extends EventType,U extends EventBodyResponse<any>>(connection: WebSocketServerConnection, event: EventBodyRequest<T,U>, response:ResponseMessageHandler<U>){
    event.requestId = self.crypto.randomUUID();
    this.responseCallbacks.set(event.requestId,response);
    this.sendToServer(connection,event);
  }

  public addHandler<T extends EventType>(t: EventType, handler: MessageHandler<T>) {
    if (this.messageHandlers.get(t))
      console.warn("Message handler for " + t + " already exists, overwrite...")
    this.messageHandlers.set(t, handler);
  }

  public async handleEvent<T extends EventType>(connection: WebSocketServerConnection, event: EventBody<T>) {
    if ('respondsTo' in event){
      const eventResponse = event as EventBodyResponse<T>;
      const responseHandler = this.responseCallbacks.get(eventResponse.respondsTo);
      if (!responseHandler){
        console.warn("No response handler for " + JSON.stringify(eventResponse));
        console.warn("Message was: " + JSON.stringify(event));
      }else{
        this.responseCallbacks.delete(eventResponse.respondsTo);
        responseHandler(eventResponse,connection);
      }
    }
    const handler = this.messageHandlers.get(event.type);
    if (!handler) {
      console.warn("No handler for message of type " + event.type + " exists. Ignoring");
      console.warn("Message was: " + JSON.stringify(event));
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


  private onIceServerData(event: IceServerData, connection: WebSocketServerConnection) {
    console.log("ws: added " + event.iceServers.length + " ice servers");
    connection.config.iceServers = event.iceServers;
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

export type ResponseMessageHandler<U extends EventBodyResponse<any>> = (event: U, connection: WebSocketServerConnection) => void | any;
