import {Component, Input} from '@angular/core';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import { WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {InterfaceService} from '../../../services/interface-service';
import {UserEntry} from '../user-entry/user-entry';
import {ChannelEntry} from '../channel-entry/channel-entry';
import {clientsInChannel} from '../../../services/Util';
import {ClientsInChannelPipe} from '../../../pipes/clients-in-channel-pipe';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    UserEntry,
    ChannelEntry,
    ClientsInChannelPipe
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {

  @Input() connection!: WebSocketServerConnection;

  constructor(protected webSocketService: WebSocketService,
              protected interfaceService: InterfaceService) {

  }

  protected readonly clientsInChannel = clientsInChannel;
}
