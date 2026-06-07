import { Component, inject } from '@angular/core';
import {ServerSelector} from './server-selector/server-selector';
import {WebSocketService} from '../../services/websocket/web-socket-service';
import {Server} from './server/server';
import {Settings} from '../settings/settings';

@Component({
  selector: 'app-main',
  imports: [
    ServerSelector,
    Server,
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {
  protected webSocketService = inject(WebSocketService);

}
