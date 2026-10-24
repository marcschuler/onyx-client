import {Component, Input} from '@angular/core';
import {FilePreview} from "../../ui/file-preview/file-preview";
import {MarkdownPipe} from "../../../pipes/markdown-pipe";
import {
  FileMessageContentDTO,
  MarkdownMessageContentDTO,
  MessageContentDTO,
  TextMessageContentDTO
} from '../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';

@Component({
  selector: 'app-message-content',
    imports: [
        FilePreview,
        MarkdownPipe,
    ],
  templateUrl: './message-content.html',
  styleUrl: './message-content.css',
})
export class MessageContent {

  @Input() content!: MessageContentDTO;
  @Input() connection!: WebSocketServerConnection;

  readonly asTypeText = asTypeText;
  readonly asTypeMarkdown = asTypeMarkdown;
  readonly asTypeFile = asTypeFile;

}

export function asTypeMarkdown(messageContainer: MessageContentDTO) {
  return messageContainer as MarkdownMessageContentDTO;
}

export function asTypeFile(messageContainer: MessageContentDTO) {
  return messageContainer as FileMessageContentDTO;
}

export function asTypeText(messageContainer: MessageContentDTO) {
    return messageContainer as TextMessageContentDTO;
}
