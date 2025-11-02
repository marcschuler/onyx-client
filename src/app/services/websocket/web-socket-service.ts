import {Injectable} from '@angular/core';
import {Client, ConnectionState, KeyId, ServerObjectId, WebSocketServerConnection} from './WebSocketServerConnection';
import {Identity, IdentityService} from '../identity-service';
import {ServerConnection} from '../server-loader-service';
import {CryptoService} from '../crypto-service';
import {ToastService, ToastType} from '../toast-service';
import {PeerConnectionService} from '../peer/peer-connection-service';
import {
  AuthChallengeRequest, AuthChallengeResponse,
  AuthSuccessMessage,
  ClientChannelJoinMessage, ClientChannelLeaveMessage, IceServerMessage, MessageBody,
  MessageBodyRequest, MessageBodyResponse, MessageTypes,
  ServerTreeChangeMessage
} from '../../../api/webrtc-server';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  LOG_MESSAGES: boolean = false;

  connection: WebSocketServerConnection | undefined;

  private messageHandlers: Map<MessageTypes, MessageHandler<any>> = new Map();

  private responseCallbacks: Map<string,ResponseMessageHandler<any>> = new Map();

  constructor(private identityService: IdentityService, private cryptoService: CryptoService, private toastService: ToastService,
              private peerConnectionService: PeerConnectionService) {
    this.addHandler(AuthChallengeRequest.TypeEnum.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(AuthSuccessMessage.TypeEnum.AuthSuccessMessage, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessMessage, c));
    this.addHandler(ServerTreeChangeMessage.TypeEnum.ServerTreeChangeMessage, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeMessage, c))
    this.addHandler(ClientChannelJoinMessage.TypeEnum.ClientChannelJoinMessage, (e, c) => this.onClientChannelJoinEvent(e as ClientChannelJoinMessage, c))
    this.addHandler(ClientChannelLeaveMessage.TypeEnum.ClientChannelLeaveMessage, (e, c) => this.onClientChannelLeaveEvent(e as ClientChannelLeaveMessage, c));
    this.addHandler(IceServerMessage.TypeEnum.IceServerMessage, (e, c) => this.onIceServerData(e as IceServerMessage, c));
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
        const data: MessageBody = JSON.parse(event.data);
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



  public send(connection: WebSocketServerConnection, event: MessageBody | MessageBodyRequest) {
    if (this.LOG_MESSAGES)
      console.log("ws: sending data: " + JSON.stringify(event))
    connection.serverConnection.send(JSON.stringify(event));
  }

  public sendWithResponse<U extends MessageBodyResponse>(connection: WebSocketServerConnection, message: MessageBodyRequest, response:ResponseMessageHandler<U>){
    message.requestId = self.crypto.randomUUID();
    this.responseCallbacks.set(message.requestId,response);
    this.send(connection,message);
  }

  public addHandler<T extends MessageBody>(t: MessageTypes, handler: MessageHandler<T>) {
    if (this.messageHandlers.get(t))
      console.warn("Message handler for " + t + " already exists, overwrite...")
    this.messageHandlers.set(t, handler);
  }

  public async handleEvent(connection: WebSocketServerConnection, event: MessageBody) {
    if ('respondsTo' in event){
      const eventResponse = event as MessageBodyResponse;
      const responseHandler = this.responseCallbacks.get(eventResponse.respondsTo);
      if (!responseHandler){
        console.warn("No response handler for " + JSON.stringify(eventResponse));
        console.warn("Message was: " + JSON.stringify(event));
      }else{
        this.responseCallbacks.delete(eventResponse.respondsTo);
        responseHandler(eventResponse,connection);
      }
    }
    const handler = this.messageHandlers.get(event.type as MessageTypes);
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

    this.send(connection, {
      username: connection.identity.username,
      publicKey: await this.cryptoService.exportKey(connection.identity.keyPair.publicKey),
      challenge: signature,
      type: AuthChallengeResponse.TypeEnum.AuthChallengeResponse
    } as AuthChallengeResponse)
  }

  private async onAuthSuccessEvent(event: AuthSuccessMessage, connection: WebSocketServerConnection) {
    console.log("ws: server did welcome us - auth successfully")
    connection.state = ConnectionState.CONNECTED;
    this.connection = connection;
  }

  private async onServerTreeChangeEvent(event: ServerTreeChangeMessage, connection: WebSocketServerConnection) {
    connection.data = event;
  }


  private onIceServerData(event: IceServerMessage, connection: WebSocketServerConnection) {
    console.log("ws: added " + event.iceServers.length + " ice servers");
    connection.config.iceServers = event.iceServers;
  }

  private onClientChannelJoinEvent(event: ClientChannelJoinMessage, connection: WebSocketServerConnection) {
    const clients = connection.clients.filter(c => event.user.id == c.id);
    let client: Client | undefined;
    if (clients.length == 0) {
      client = {
        id: event.user.id as KeyId,
        username: event.user.username,
        publicKey: event.user.publicKey,
        channel: event.channelId as ServerObjectId
      };
      connection.clients.push(client);
    } else {
      client = clients[0];
      client.channel = event.channelId as ServerObjectId;
    }
    if (this.isMe(client, connection))
      connection.currentChannel = client.channel;

    this.peerConnectionService.updatePeerConnections();
  }


  private onClientChannelLeaveEvent(event: ClientChannelLeaveMessage, connection: WebSocketServerConnection) {
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

export type MessageHandler<T extends MessageBody> = (event: T, connection: WebSocketServerConnection) => void | any;

export type ResponseMessageHandler<U extends MessageBodyResponse> = (event: U, connection: WebSocketServerConnection) => void | any;

