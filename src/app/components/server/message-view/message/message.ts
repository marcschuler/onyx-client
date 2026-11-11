import {Component, Input, inject, Output, EventEmitter} from '@angular/core';
import {MarkdownMessageContentDTO, MessageDTO} from "../../../../../api/onyx-server";
import {AsyncPipe, NgClass} from '@angular/common';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {UserDatePipe} from '../../../../pipes/user-date-pipe';
import {StorageService} from '../../../../services/storage.service';
import {Tooltip} from '../../../../directives/tooltip';
import {LucideGhost, LucideMessageSquareReply} from '@lucide/angular';
import {StorageFileURLPipe} from '../../../../pipes/avatar-pipe';
import {asTypeFile, asTypeMarkdown, asTypeText, MessageContent} from '../../../chat/message-content/message-content';
import {ContextMenuService} from '../../../../services/ui/context-menu-service';
import {MessageContextMenu} from '../../../chat/message-context-menu/message-context-menu';
import {ProfileImage} from '../../../client/profile-image/profile-image';
import {ReactionGroup, ReactionGroupingPipe} from '../../../../pipes/reaction-grouping-pipe';
import {ToggleButton} from '../../../ui/toggle-button/toggle-button';
import {RestService} from '../../../../services/rest/rest-service';

@Component({
  selector: 'app-message',
  imports: [
    MarkdownPipe,
    UserDatePipe,
    Tooltip,
    LucideGhost,
    LucideMessageSquareReply,
    StorageFileURLPipe,
    MessageContent,
    ProfileImage,
    ReactionGroupingPipe,
    ToggleButton,
  ],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  protected interfaceService = inject(StorageService);
  protected contextMenuService = inject(ContextMenuService);
  private restService = inject(RestService);

  @Input() message!: MessageDTO;
  @Input() lastMessage: MessageDTO | undefined;

  @Input() replyLayer: number = 0;

  @Input() connection!: WebSocketServerConnection;
  @Output() onReply: EventEmitter<MessageDTO> = new EventEmitter<MessageDTO>();

  protected readonly asTypeMarkdown = asTypeMarkdown;
  protected readonly asTypeFile = asTypeFile;

  protected openMessageContextMenu(event: MouseEvent) {
    const menu = this.contextMenuService.openContextMenu(MessageContextMenu, event, {
      connection: this.connection,
      message: this.message,
    });
    menu.componentRef.instance.onReply.subscribe((message) => {
      this.onReply.emit(message);
    })
  }

  protected openClientContextMenu($event: PointerEvent) {
    this.contextMenuService.openClientContextMenu(this.message.user, this.connection, $event);
  }

  protected readonly asTypeText = asTypeText;
  protected readonly MESSAGE_REPLY_MAXSHOWN = MESSAGE_REPLY_MAXSHOWN;


  protected reactionTitle(reactions: ReactionGroup) {
    return reactions.emoji + " from " + reactions.reactions.map(reaction => reaction.user.username)
      .join(", ");
  }

  protected isEmojiActive(reactions: ReactionGroup) {
    return reactions.reactions.find(reaction => reaction.user.id == this.connection.me.id)
      != undefined;

  }

  protected react(emoji: string, active: boolean) {
    const request = active ? this.connection.rest.chatController.removeReaction(this.message.chatId, this.message.id, emoji)
      : this.connection.rest.chatController.addReaction(this.message.chatId, this.message.id, emoji)

    request.subscribe(() => {
    }, error => this.restService.handleError(error));
  }
}

const MESSAGE_REPLY_MAXSHOWN = 2;
