import {Component, Input, inject, Output, EventEmitter} from '@angular/core';
import {MessageDTO} from "../../../../../api/webrtc-server";
import {AsyncPipe, NgClass} from '@angular/common';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {UserDatePipe} from '../../../../pipes/user-date-pipe';
import {StorageService} from '../../../../services/storage.service';
import {Tooltip} from '../../../../directives/tooltip';
import {
  CornerDownRightIcon,
  LucideAngularModule
} from 'lucide-angular';
import {StorageFileURLPipe} from '../../../../pipes/avatar-pipe';
import {asTypeFile, asTypeMarkdown, MessageContent} from '../../../chat/message-content/message-content';
import {ContextMenuService} from '../../../../services/ui/context-menu-service';
import {MessageContextMenu} from '../../../chat/message-context-menu/message-context-menu';

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
  protected contextMenuService = inject(ContextMenuService);

  @Input() message!: MessageDTO;
  @Input() lastMessage: MessageDTO | undefined;

  @Input() connection!: WebSocketServerConnection;
  @Output() onReply: EventEmitter<MessageDTO> = new EventEmitter<MessageDTO>();

  protected readonly asTypeMarkdown = asTypeMarkdown;
  protected readonly asTypeFile = asTypeFile;

  protected openReplyContextMenu(event: MouseEvent) {
    const menu = this.contextMenuService.openContextMenu(MessageContextMenu, event, {
      connection: this.connection,
      message: this.message,
    });
    menu.componentRef.instance.onReply.subscribe((message) => {
      this.onReply.emit(message);
    })
  }

  protected readonly CornerDownRightIcon = CornerDownRightIcon;
}
