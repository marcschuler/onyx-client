import { Component, HostListener, Input, inject } from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';
import {ChannelView} from './channel-view/channel-view';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {
  BookUser,
  LogOut,
  LucideAngularModule,
  PanelLeftClose,
  PanelLeftOpen,
  ServerCog,
} from 'lucide-angular';
import { NgStyle} from '@angular/common';
import {StorageService} from '../../../services/storage.service';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ServerOverview} from './server-overview/server-overview';
import {AdminPanel} from './admin-panel/admin-panel';
import {UsersPanel} from './users-panel/users-panel';
import {ContextMenuService} from '../../../services/ui/context-menu-service';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel,
    ChannelView,
    LucideAngularModule,
    NgStyle,
    ServerOverview,
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {
  protected webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);
  protected contextMenuService = inject(ContextMenuService);


  @Input() connection!: WebSocketServerConnection;

  private resizing = false;
  private minWidth = 150;
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



  protected closeConnection() {
    this.webSocketService.closeConnection(this.connection);
  }


  protected openAdminPanel() {
    this.contextMenuService.openPopup(AdminPanel,{
      connection: this.connection
    })
  }

  protected openUserPanel() {
    this.contextMenuService.openPopup(UsersPanel,{
      connection: this.connection
    })
  }

  protected readonly ServerCog = ServerCog;
  protected readonly BookUser = BookUser;
  protected readonly PanelLeftClose = PanelLeftClose;
  protected readonly PanelLeftOpen = PanelLeftOpen;
  protected readonly LogOut = LogOut;
}
