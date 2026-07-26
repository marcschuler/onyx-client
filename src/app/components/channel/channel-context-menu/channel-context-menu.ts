import {Component, inject, Input} from '@angular/core';
import {ContextMenu} from "../../ui/context/context-menu/context-menu";
import {ContextMenuButton} from "../../ui/context/context-menu-button/context-menu-button";
import {ProfileImage} from "../../client/profile-image/profile-image";
import {ChannelDTO} from '../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChevronDownIcon, ChevronUpIcon, HexagonIcon, LucideAngularModule} from 'lucide-angular';
import {ContextMenuService, POPUP_CONTEXT, PopupControl} from '../../../services/ui/context-menu-service';
import {ChannelEditor} from '../channel-editor/channel-editor';

@Component({
  selector: 'app-channel-context-menu',
  imports: [
    ContextMenu,
    ContextMenuButton,
    ProfileImage,
    LucideAngularModule
  ],
  templateUrl: './channel-context-menu.html',
  styleUrl: './channel-context-menu.css',
})
export class ChannelContextMenu {

  @Input() channel!: ChannelDTO;
  @Input() connection!: WebSocketServerConnection;

  private contextMenuService = inject(ContextMenuService);
  protected popupContext = inject(POPUP_CONTEXT);

  protected readonly ChevronUpIcon = ChevronUpIcon;
  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly HexagonIcon = HexagonIcon;

  protected edit() {
    this.popupContext.close()
    this.contextMenuService.openPopup(ChannelEditor, {
      connection: this.connection,
      channelId: this.channel.id
    })
  }
}
