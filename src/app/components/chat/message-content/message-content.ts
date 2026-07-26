import {Component, Input} from '@angular/core';
import {FilePreview} from "../../ui/file-preview/file-preview";
import {FileSizePipe} from "../../../pipes/file-size-pipe";
import {MarkdownPipe} from "../../../pipes/markdown-pipe";
import {StorageFileURLPipe} from "../../../pipes/avatar-pipe";
import {FileMessageContentDTO, MarkdownMessageContentDTO, MessageContentDTO} from '../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';

@Component({
  selector: 'app-message-content',
    imports: [
        FilePreview,
        FileSizePipe,
        MarkdownPipe,
        StorageFileURLPipe
    ],
  templateUrl: './message-content.html',
  styleUrl: './message-content.css',
})
export class MessageContent {

  @Input() content!: MessageContentDTO;
  @Input() connection!: WebSocketServerConnection;

  readonly asTypeMarkdown = asTypeMarkdown;
  readonly asTypeFile = asTypeFile;

}

export function asTypeMarkdown(messageContainer: MessageContentDTO) {
  return messageContainer as MarkdownMessageContentDTO;
}

export function asTypeFile(messageContainer: MessageContentDTO) {
  return messageContainer as FileMessageContentDTO;
}
