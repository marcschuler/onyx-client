import {Component, HostListener, Input} from '@angular/core';
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
import {NgClass, NgStyle} from '@angular/common';
import {InterfaceService} from '../../../services/interface-service';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {ServerOverview} from './server-overview/server-overview';
import {AdminPanel} from './admin-panel/admin-panel';
import {UsersPanel} from './users-panel/users-panel';
import {ServerLoaderService} from '../../../services/server-loader-service';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel,
    ChannelView,
    LucideAngularModule,
    NgStyle,
    Popup,
    Settings,
    ServerOverview,
    AdminPanel,
    UsersPanel,
    NgClass
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {

  @Input() connection!: WebSocketServerConnection;

  showSettings = false;
  showAdminPanel = false;
  showUsersPanel = false;

  private resizing = false;
  private minWidth = 100;
  private maxWidth = 500;
  protected minimized = false;

  constructor(protected webSocketService: WebSocketService,
              protected interfaceService: InterfaceService,
              protected serverLoaderService: ServerLoaderService) {
  }


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
