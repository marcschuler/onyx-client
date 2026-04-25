import { Pipe, PipeTransform } from '@angular/core';
import {Client} from '../services/websocket/WebSocketServerConnection';
import {clientsInChannel} from '../services/Util';

@Pipe({
  name: 'clientsInChannel',
  pure: false
})
export class ClientsInChannelPipe implements PipeTransform {

  transform(clients:Client[], channelId: string | undefined): unknown {
    return clientsInChannel(clients, channelId);
  }

}
