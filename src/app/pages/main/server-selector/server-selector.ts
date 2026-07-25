import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {Spinner} from '../../../components/ui/spinner/spinner';
import {
  ServerConnection,
  ServerLoaderService
} from '../../../services/server-loader-service';
import {FormsModule} from '@angular/forms';
import {
  ArrowBigRightDash,
  LucideAngularModule,
  ServerIcon,
  ServerOffIcon,
  SettingsIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Identity, IdentityService} from '../../../services/identity-service';
import { BUTTON_CANCEL,  Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {ServerDTO} from '../../../../api/webrtc-server/model/serverDTO';
import {RestService} from '../../../services/rest-service';
import {HttpErrorResponse} from '@angular/common/http';
import {PreviewImage} from '../../../components/ui/preview-image/preview-image';
import {ContextMenuService} from '../../../services/ui/context-menu-service';

@Component({
  selector: 'app-server-selector',
  imports: [
    Spinner,
    FormsModule,
    LucideAngularModule,
    PreviewImage,
  ],
  templateUrl: './server-selector.html',
  styleUrl: './server-selector.css'
})
export class ServerSelector implements OnInit, OnDestroy {
  protected serverLoaderService = inject(ServerLoaderService);
  private webSocketService = inject(WebSocketService);
  private restService = inject(RestService);
  protected identityService = inject(IdentityService);
  protected contextMenuService = inject(ContextMenuService);


  CONNECTING_STATE: ServerInfoWithState = {
    error: undefined,
    success: undefined,
    state: ServerInfoState.CONNECTING
  }

  protected identity: Identity | undefined;


  selectedServer: ServerConnection | undefined;

  serverDetails = new Map<ServerConnection, ServerInfoWithState>();

  customUrl = "";
  customUrlError: string | undefined;

  private interval!: number;

  constructor() {
    const identityService = this.identityService;

    identityService.defaultIdentity().then(value => {
      this.identity = value;
    })

  }

  ngOnInit() {
    this.updateDetails();
    this.interval = window.setInterval(() => this.updateDetails(), 8000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  updateDetails() {
    this.serverLoaderService.connections.forEach(connection => {
      this.serverLoaderService.serverDetails(connection)
        .then(serverDetail => {
          this.serverDetails.set(connection, {
            state: ServerInfoState.SUCCESS,
            error: undefined,
            success: serverDetail
          });
        })
        .catch(error => {
          this.setErrorMessageForConnection(connection, error);
        })
    })
  }

  addAndConnectToCustomUrl() {
    const server = {
      id: crypto.randomUUID(),
      url: this.customUrl
    };
    this.serverLoaderService.addServer(server)
    this.updateDetails();
    this.customUrl = "";
    this.serverLoaderService.serverDetails(server)
      .then(() => {
        this.connect(server)
      })
      .catch((error: HttpErrorResponse) => {
        console.log("server-selector: error", JSON.stringify(error));
        this.setErrorMessageForConnection(server, error);
      })
  }

  private setErrorMessageForConnection(connection: ServerConnection, error: HttpErrorResponse) {
    console.log("server-selector: error", JSON.stringify(error));
    this.serverDetails.set(connection, {
      state: ServerInfoState.ERROR,
      success: undefined,
      error: this.restService.buildErrorMessage(error)
    });
  }

  connect(server: ServerConnection) {
    this.selectedServer = server;
    this.webSocketService.connect(server, this.identity!)
      .then(c => this.selectedServer = undefined)
      .catch(e => this.selectedServer = undefined);
  }


  protected readonly ServerIcon = ServerIcon;
  protected readonly ServerInfoState = ServerInfoState;
  protected readonly ServerOffIcon = ServerOffIcon;
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly ArrowBigRightDash = ArrowBigRightDash;
  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
}

export interface ServerInfoWithState {
  state: ServerInfoState;
  success: ServerDTO[] | undefined;
  error: string | undefined;
}

export enum ServerInfoState {
  CONNECTING,
  SUCCESS,
  ERROR
}
