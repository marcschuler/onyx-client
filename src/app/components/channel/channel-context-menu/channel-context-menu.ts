import {Component, Input} from '@angular/core';
import {ContextMenu} from "../../ui/context/context-menu/context-menu";
import {ContextMenuButton} from "../../ui/context/context-menu-button/context-menu-button";
import {ProfileImage} from "../../client/profile-image/profile-image";
import {ChannelDTO} from '../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChevronDownIcon, ChevronUpIcon, HexagonIcon, LucideAngularModule} from 'lucide-angular';

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

  protected readonly ChevronUpIcon = ChevronUpIcon;
  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly HexagonIcon = HexagonIcon;
}
