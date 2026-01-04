import {Component, Input} from '@angular/core';
import { WebSocketServerConnection } from "../../../../services/websocket/WebSocketServerConnection";

@Component({
  selector: 'app-server-overview',
  imports: [],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {
  @Input() connection!: WebSocketServerConnection;

}
