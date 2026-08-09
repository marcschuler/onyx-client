import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ContextMenu} from "../../ui/context/context-menu/context-menu";
import {ContextMenuButton} from "../../ui/context/context-menu-button/context-menu-button";
import {CornerDownRightIcon, XIcon} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {MessageDeleteEvent, MessageDTO} from '../../../../api/onyx-server';
import {POPUP_CONTEXT} from '../../../services/ui/context-menu-service';
import {RestService} from '../../../services/rest-service';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {WebSocketService} from '../../../services/websocket/web-socket-service';

@Component({
  selector: 'app-message-context-menu',
  imports: [
    ContextMenu,
    ContextMenuButton
  ],
  templateUrl: './message-context-menu.html',
  styleUrl: './message-context-menu.css',
})
export class MessageContextMenu implements OnInit, OnDestroy {

  private popupContext = inject(POPUP_CONTEXT);
  private restService = inject(RestService);
  private toastService = inject(ToastService);
  private webSocketService = inject(WebSocketService);

  @Input() connection!: WebSocketServerConnection;
  @Input() message!: MessageDTO;
  @Output() onReply: EventEmitter<MessageDTO> = new EventEmitter<MessageDTO>();
  @Output() onDelete: EventEmitter<MessageDTO> = new EventEmitter<MessageDTO>();

  private handler: any;

  ngOnInit(): void {
    this.handler = this.webSocketService.addHandler(MessageDeleteEvent.TypeEnum.MessageDeleteEvent, (event: MessageDeleteEvent) => {
      if (this.message.id === event.id) {
        console.log("closing message context menu");
        this.popupContext.close();
      }
    })
  }

  ngOnDestroy(): void {
    this.webSocketService.removeHandler(this.handler);
  }


  protected reply() {
    this.onReply.emit(this.message);
    this.popupContext.close();
  }

  protected delete() {
    this.connection.rest.chatController.deleteMessage(this.message.chatId, this.message.id)
      .subscribe(() => {
        this.onDelete.emit(this.message);
        this.toastService.create({
          type: ToastType.Success,
          message: "Message deleted"
        })
      }, error => this.restService.handleError(error))
  }


  protected readonly CornerDownRightIcon = CornerDownRightIcon;
  protected readonly XIcon = XIcon;

}
