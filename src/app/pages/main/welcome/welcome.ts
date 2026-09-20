import {Component, inject} from '@angular/core';
import {
  ServerDetails,
  ServerLoaderService
} from '../../../services/server-loader-service';
import {FormsModule} from '@angular/forms';
import {
  LucideAngularModule,
  SettingsIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Identity, IdentityService} from '../../../services/identity-service';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {ServerEntry} from './server-entry/server-entry';
import {APP_VERSION} from '../../../services/Util';

@Component({
  selector: 'app-server-selector',
  imports: [
    FormsModule,
    LucideAngularModule,
    ServerEntry,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {
  protected serverLoaderService = inject(ServerLoaderService);
  protected identityService = inject(IdentityService);
  protected contextMenuService = inject(ContextMenuService);
  private webSocketService = inject(WebSocketService);

  protected identity: Identity | undefined;

  selectedServer: ServerDetails | undefined;
  customUrl = "";

  constructor() {
    const identityService = this.identityService;

    identityService.defaultIdentity().then(value => {
      this.identity = value;
    })
  }

  connect(server: ServerDetails) {
    this.selectedServer = server;
    this.webSocketService.connect(server, this.identity!)
      .then(_ => this.selectedServer = undefined)
      .catch(_ => this.selectedServer = undefined);
  }

  addAndConnectToCustomUrl() {
    const server = {
      id: crypto.randomUUID(),
      url: this.customUrl
    };
    this.serverLoaderService.addServer(server)
    this.customUrl = "";

  }

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly APP_VERSION = APP_VERSION;
}
