import {Component, HostListener} from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';
import {ChannelView} from './channel-view/channel-view';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {InfoIcon, LucideAngularModule, SettingsIcon} from 'lucide-angular';
import {NgStyle} from '@angular/common';
import {InterfaceService} from '../../../services/interface-service';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel,
    ChannelView,
    LucideAngularModule,
    NgStyle
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {

  editMode = false;

  private resizing = false;
  private minWidth = 100;
  private maxWidth = 500;

  constructor(protected webSocketService:WebSocketService,
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
}
