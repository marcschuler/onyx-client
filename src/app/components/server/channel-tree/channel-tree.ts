import { Component, Input, inject } from '@angular/core';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import { WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {StorageService} from '../../../services/storage.service';
import {UserEntry} from '../user-entry/user-entry';
import {ChannelEntry} from '../channel-entry/channel-entry';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    UserEntry,
    ChannelEntry,
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {
  protected webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);


  @Input() connection!: WebSocketServerConnection;
}
