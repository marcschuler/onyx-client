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
import {ServerEntry, ServerJoinDetails} from './server-entry/server-entry';
import {APP_VERSION} from '../../../services/Util';
import {BUTTON_CANCEL, BUTTON_DELETE} from '../../../components/ui/dialog/dialog';
import {ToastService, ToastType} from '../../../services/ui/toast-service';

@Component({
  selector: 'app-welcome',
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
  protected toastService = inject(ToastService);

  protected identity: Identity | undefined;

  selectedServer: ServerDetails | undefined;
  customUrl = "";

  constructor() {
    const identityService = this.identityService;

    identityService.defaultIdentity().then(value => {
      this.identity = value;
    })
  }

  connect(server: ServerJoinDetails) {
    let password = server.detail.password;
    if (password == undefined && server.serverPassword) {
      this.contextMenuService.openSettingsMenu(undefined, 'server-connection-' + server.detail.id);
      this.toastService.create({
        title: "The server requires a password",
        type: ToastType.Warning
      })
      return;
    }
    console.log("password" + password)

    this.selectedServer = server.detail;
    this.webSocketService.connect(server.detail, this.identity!, password)
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

  protected readonly APP_VERSION = APP_VERSION;
}
