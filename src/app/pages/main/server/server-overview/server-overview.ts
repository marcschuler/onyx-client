import {Component, Input} from '@angular/core';
import { WebSocketServerConnection } from "../../../../services/websocket/WebSocketServerConnection";
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {MessageContent} from '../../../../components/chat/message-content/message-content';

@Component({
  selector: 'app-server-overview',
  imports: [
    MessageContent
  ],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {

  @Input() connection!: WebSocketServerConnection;


}
