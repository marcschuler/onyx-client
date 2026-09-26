import {Component, inject, Input} from '@angular/core';
import {WebSocketServerConnection} from "../../../../services/websocket/WebSocketServerConnection";
import {MessageContent} from '../../../../components/chat/message-content/message-content';
import {PreviewImage} from '../../../../components/ui/preview-image/preview-image';
import {BookUserIcon, LogOutIcon, LucideAngularModule, ServerCog, ServerCogIcon} from 'lucide-angular';
import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {StorageService} from '../../../../services/storage.service';
import {ContextMenuService} from '../../../../services/ui/context-menu-service';
import {AdminPanel} from '../admin-panel/admin-panel';
import {UsersPanel} from '../users-panel/users-panel';

@Component({
  selector: 'app-server-overview',
  imports: [
    MessageContent,
    PreviewImage,
    LucideAngularModule
  ],
  templateUrl: './server-overview.html',
  styleUrl: './server-overview.css'
})
export class ServerOverview {
  protected webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);
  protected contextMenuService = inject(ContextMenuService);

  @Input() connection!: WebSocketServerConnection;


  protected closeConnection() {
    this.webSocketService.closeConnection(this.connection);
  }


  protected openAdminPanel() {
    this.contextMenuService.openPopup(AdminPanel, {
      connection: this.connection
    })
  }

  protected openUserPanel() {
    this.contextMenuService.openPopup(UsersPanel, {
      connection: this.connection
    }, {
      fullHeight: true,
      closeButton: true
    })
  }
  protected readonly LogOutIcon = LogOutIcon;
}
