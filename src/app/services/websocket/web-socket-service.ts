import {Injectable} from '@angular/core';
import {ConnectionState, WebSocketServerConnection} from './WebSocketServerConnection';
import {Identity, IdentityService} from '../identity-service';
import {ServerConnection} from '../server-loader-service';
import {CryptoService} from '../crypto-service';
import {
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthSuccessEvent,
  EventBody,
  EventType,
  ServerTreeChangeEvent
} from './WebSocketEvents';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  connection: WebSocketServerConnection | undefined;

  private messageHandlers: Map<EventType, MessageHandler<any>> = new Map();

  constructor(private identityService: IdentityService, private cryptoService: CryptoService) {
    this.addHandler(EventType.AuthChallengeRequest, (e, c) => this.onAuthChallengeRequest(e as AuthChallengeRequest, c));
    this.addHandler(EventType.AuthSuccessEvent, (e, c) => this.onAuthSuccessEvent(e as AuthSuccessEvent, c));
    this.addHandler(EventType.ServerTreeChangeEvent, (e, c) => this.onServerTreeChangeEvent(e as ServerTreeChangeEvent, c))
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
        identity: identity
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
      };
      webSocket.onerror = (error) => {
        console.error('ws: Error on connection', error);
        //TODO is connection closed? What is the state?
        connection.state = ConnectionState.ERROR;
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

}

export type MessageHandler<T extends EventType> = (event: EventBody<T>, connection: WebSocketServerConnection) => void | any;

