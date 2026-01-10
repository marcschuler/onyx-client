import {Component, HostListener, Input} from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';
import {ChannelView} from './channel-view/channel-view';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {InfoIcon, LucideAngularModule, ServerCog, SettingsIcon} from 'lucide-angular';
import {NgStyle} from '@angular/common';
import {InterfaceService} from '../../../services/interface-service';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {ServerOverview} from './server-overview/server-overview';
import {AdminPanel} from './admin-panel/admin-panel';

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
    AdminPanel
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {

  @Input() connection!: WebSocketServerConnection;

  editMode = false;
  showSettings = false;
  showAdminPanel: boolean = false;

  private resizing = false;
  private minWidth = 100;
  private maxWidth = 500;

  constructor(protected webSocketService: WebSocketService,
              protected interfaceService: InterfaceService,) {
  }

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly InfoIcon = InfoIcon;

  startResizing($event: MouseEvent) {
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

  protected readonly ServerCog = ServerCog;
}
