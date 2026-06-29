import { Component, HostListener, Input, inject } from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';
import {ChannelView} from './channel-view/channel-view';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {
  BookUser,
  InfoIcon, LogOut,
  LucideAngularModule,
  PanelLeftClose,
  PanelLeftOpen,
  ServerCog, ServerIcon,
  SettingsIcon
} from 'lucide-angular';
import { NgStyle} from '@angular/common';
import {StorageService} from '../../../services/storage.service';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {ServerOverview} from './server-overview/server-overview';
import {AdminPanel} from './admin-panel/admin-panel';
import {UsersPanel} from './users-panel/users-panel';
import {ServerLoaderService} from '../../../services/server-loader-service';
import {Tooltip} from '../../../directives/tooltip';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel,
    ChannelView,
    LucideAngularModule,
    NgStyle,
    Popup,
    ServerOverview,
    AdminPanel,
    UsersPanel,
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {
  protected webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);
  protected serverLoaderService = inject(ServerLoaderService);


  @Input() connection!: WebSocketServerConnection;

  showSettings = false;
  showAdminPanel = false;
  showUsersPanel = false;

  private resizing = false;
  private minWidth = 100;
  private maxWidth = 500;
  protected minimized = false;


  startResizing($event: MouseEvent) {
    if (this.minimized)
      return;
    this.resizing = true;
    $event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;
    const newWidth = event.clientX;
    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.interfaceService.settings.sidebarWidth = newWidth;
    }
  }

  @HostListener('document:mouseup')
  stopResizing() {
    if (this.resizing) {
      this.resizing = false;
      this.interfaceService.saveSettings();
    }
  }


  protected readonly SettingsIcon = SettingsIcon;
  protected readonly InfoIcon = InfoIcon;
  protected readonly ServerCog = ServerCog;
  protected readonly BookUser = BookUser;
  protected readonly PanelLeftClose = PanelLeftClose;
  protected readonly PanelLeftOpen = PanelLeftOpen;
  protected readonly LogOut = LogOut;

  protected closeConnection() {
    this.webSocketService.closeConnection(this.connection);
  }

  protected readonly ServerIcon = ServerIcon;
}
