import { Component, inject } from '@angular/core';
import {Welcome} from './welcome/welcome';
import {WebSocketService} from '../../services/websocket/web-socket-service';
import {Server} from './server/server';
import {Settings} from '../settings/settings';

@Component({
  selector: 'app-main',
  imports: [
    Welcome,
    Server,
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {
  protected webSocketService = inject(WebSocketService);

}
