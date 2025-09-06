import {Component} from '@angular/core';
import {ServerSelector} from './server-selector/server-selector';
import {WebSocketService} from '../../services/websocket/web-socket-service';
import {Server} from './server/server';

@Component({
  selector: 'app-main',
  imports: [
    ServerSelector,
    Server
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {

  constructor(protected webSocketService: WebSocketService) {
  }

}
