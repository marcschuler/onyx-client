import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {Button, BUTTON_CANCEL, BUTTON_DELETE, BUTTON_EDIT, Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {ServerDTO} from '../../../../api/webrtc-server/model/serverDTO';
import {RestService} from '../../../services/rest-service';
import {HttpErrorResponse} from '@angular/common/http';
import {APP_VERSION} from '../../../services/Util';
import {PreviewImage} from '../../../components/ui/preview-image/preview-image';

@Component({
  selector: 'app-server-selector',
  imports: [
    Spinner,
    FormsModule,
    LucideAngularModule,
    Popup,
    Settings,
    PreviewImage,
  ],
  templateUrl: './server-selector.html',
  styleUrl: './server-selector.css'
})
export class ServerSelector implements OnInit, OnDestroy {

  CONNECTING_STATE: ServerInfoWithState = {
    error: undefined,
    success: undefined,
    state: ServerInfoState.CONNECTING
  }

  protected identity: Identity;

  showSettings: boolean = false;


  selectedServer: ServerConnection | undefined;

  serverDetails: Map<ServerConnection, ServerInfoWithState> = new Map();

  customUrl: string = "";
  customUrlError: string | undefined;

  private interval!: number;

  constructor(protected serverLoaderService: ServerLoaderService,
              private webSocketService: WebSocketService,
              private restService: RestService,
              protected identityService: IdentityService) {
    this.identity = identityService.defaultIdentity();

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
    this.webSocketService.connect(server, this.identity)
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
