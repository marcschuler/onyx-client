import {Component, Input} from '@angular/core';
import {
  HexagonIcon,
  LogInIcon, LogOut, LogOutIcon,
  LucideAngularModule,
  SettingsIcon,
  TrashIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import {AsyncPipe, NgClass} from '@angular/common';
import {ClientChannelChangeRequest} from '../../../../api/webrtc-server';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {ChannelDTO} from '../../../../api/webrtc-server/model/channelDTO';
import {ServerObjectId, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ContextMenuService} from '../../../services/context-menu-service';
import {InterfaceService} from '../../../services/interface-service';
import {UserEntry} from '../user-entry/user-entry';
import {ChannelEntry} from '../channel-entry/channel-entry';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    NgClass,
    IdenticonPipe,
    AsyncPipe,
    UserEntry,
    ChannelEntry
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {

  @Input() connection!: WebSocketServerConnection;

  readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService: WebSocketService, protected contextMenuService: ContextMenuService,
              protected interfaceService: InterfaceService) {

  }

  protected readonly LogInIcon = LogInIcon;




  protected readonly LogOut = LogOut;
  protected readonly LogOutIcon = LogOutIcon;
}
