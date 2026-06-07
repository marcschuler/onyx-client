import { Component, Input, inject } from '@angular/core';
import {MessageDTO} from "../../../../../api/webrtc-server";
import {AsyncPipe, NgClass} from '@angular/common';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {UserDatePipe} from '../../../../pipes/user-date-pipe';
import {StorageService} from '../../../../services/storage.service';
import {Tooltip} from '../../../../directives/tooltip';
import {
  LucideAngularModule
} from 'lucide-angular';
import {StorageFileURLPipe} from '../../../../pipes/avatar-pipe';
import {asTypeFile, asTypeMarkdown, MessageContent} from '../../../chat/message-content/message-content';

@Component({
  selector: 'app-message',
  imports: [
    NgClass,
    IdenticonPipe,
    AsyncPipe,
    MarkdownPipe,
    UserDatePipe,
    Tooltip,
    LucideAngularModule,
    StorageFileURLPipe,
    MessageContent,
  ],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  protected interfaceService = inject(StorageService);

  @Input() message!: MessageDTO;
  @Input() useHeader!: boolean;

  @Input() connection!: WebSocketServerConnection;

  protected readonly asTypeMarkdown = asTypeMarkdown;
  protected readonly asTypeFile = asTypeFile;
}
