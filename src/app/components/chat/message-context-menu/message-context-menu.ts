import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {ContextMenu} from "../../ui/context/context-menu/context-menu";
import {ContextMenuButton} from "../../ui/context/context-menu-button/context-menu-button";
import {ProfileImage} from "../../client/profile-image/profile-image";
import {CornerDownRightIcon, XIcon} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {MessageDTO} from '../../../../api/webrtc-server';
import {POPUP_CONTEXT} from '../../../services/context-menu-service';

@Component({
  selector: 'app-message-context-menu',
  imports: [
    ContextMenu,
    ContextMenuButton
  ],
  templateUrl: './message-context-menu.html',
  styleUrl: './message-context-menu.css',
})
export class MessageContextMenu {

  private popupContext = inject(POPUP_CONTEXT);

  @Input() connection!: WebSocketServerConnection;
  @Input() message!: MessageDTO;
  @Output() onReply: EventEmitter<MessageDTO> = new EventEmitter<MessageDTO>();

  protected readonly CornerDownRightIcon = CornerDownRightIcon;
  protected readonly XIcon = XIcon;

  protected reply() {
    this.onReply.emit(this.message);
    this.popupContext.close();
  }
}
