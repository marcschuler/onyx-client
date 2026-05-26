import {Component, Input} from '@angular/core';
import { WebSocketServerConnection } from "../../../../services/websocket/WebSocketServerConnection";
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {MessageContent} from '../../../../components/chat/message-content/message-content';
import {PreviewImage} from '../../../../components/ui/preview-image/preview-image';

@Component({
  selector: 'app-server-overview',
  imports: [
    MessageContent,
    PreviewImage
  ],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {

  @Input() connection!: WebSocketServerConnection;


}
