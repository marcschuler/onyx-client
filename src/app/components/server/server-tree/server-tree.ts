import { Component, Input, inject } from '@angular/core';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import { WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {StorageService} from '../../../services/storage.service';
import {UserEntry} from './user-entry/user-entry';
import {Channel} from './channel/channel';

@Component({
  selector: 'app-server-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    UserEntry,
    Channel,
  ],
  templateUrl: './server-tree.html',
  styleUrl: './server-tree.css'
})
export class ServerTree {
  protected webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);


  @Input() connection!: WebSocketServerConnection;
}
