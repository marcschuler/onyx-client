import {Component, Input, OnInit} from '@angular/core';
import { WebSocketServerConnection } from "../../../../services/websocket/WebSocketServerConnection";
import {ServerDTO} from '../../../../../api/webrtc-server';

@Component({
  selector: 'app-server-overview',
  imports: [],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {

  @Input() connection!: WebSocketServerConnection;


}
