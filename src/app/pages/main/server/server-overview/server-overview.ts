import {Component, Input} from '@angular/core';
import { WebSocketServerConnection } from "../../../../services/websocket/WebSocketServerConnection";
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';

@Component({
  selector: 'app-server-overview',
  imports: [
    MarkdownPipe
  ],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {

  @Input() connection!: WebSocketServerConnection;


}
