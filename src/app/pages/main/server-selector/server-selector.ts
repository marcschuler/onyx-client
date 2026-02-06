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
  SettingsIcon, Trash,
  UserIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {IdentityService} from '../../../services/identity-service';
import {Button, BUTTON_CANCEL, BUTTON_DELETE, BUTTON_EDIT, ButtonType, Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {KeyVisualizer} from '../../../components/ui/key-visualizer/key-visualizer';
import {ServerDTO} from '../../../../api/webrtc-server/model/serverDTO';
import {RestService} from '../../../services/rest-service';
import {HttpErrorResponse} from '@angular/common/http';
import {APP_VERSION} from '../../../services/Util';

@Component({
  selector: 'app-server-selector',
  imports: [
    Spinner,
    FormsModule,
    LucideAngularModule,
    Popup,
    Settings,
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


  showSettings: boolean = false;


  selectedServer: ServerConnection | undefined;
  serverToEdit: ServerConnection | undefined;
  serverToDelete: boolean = false;
  serverToEditCopy: ServerConnection | undefined;

  serverDetails: Map<ServerConnection, ServerInfoWithState> = new Map();

  customUrl: string = "";
  customUrlError: string | undefined;

  private interval!: number;

  constructor(protected serverLoaderService: ServerLoaderService,
              private webSocketService: WebSocketService,
              private restService: RestService,
              protected identityService: IdentityService) {

  }

  ngOnInit() {
    this.updateDetails();
    this.interval = setInterval(() => this.updateDetails(), 8000);
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
    this.webSocketService.connect(server, this.identityService.defaultIdentity())
      .then(c => this.selectedServer = undefined)
      .catch(e => this.selectedServer = undefined);
  }

  protected editServer(s: ServerConnection) {
    this.serverToEdit = s
    this.serverToEditCopy = JSON.parse(JSON.stringify(s));
  }

  protected closeEditDialog(button: Button) {
    if (button == BUTTON_EDIT && this.serverToEditCopy && this.serverToEdit) {
      console.log("changing server data")
      this.serverToEdit.url = this.serverToEditCopy.url;
      this.serverToEdit.name = this.serverToEditCopy.name;
      this.serverLoaderService.saveServer();
    }
    this.serverToEditCopy = undefined;
    this.serverToEdit = undefined;
  }

  removeServer(s: ServerConnection, button: Button) {
    this.serverToDelete = false;
    if (!button || button == BUTTON_CANCEL) {
      return;
    }
    this.serverToEdit = undefined;
    this.serverLoaderService.removeServer(s);

  }

  protected readonly ServerIcon = ServerIcon;
  protected readonly ServerInfoState = ServerInfoState;
  protected readonly ServerOffIcon = ServerOffIcon;
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly ArrowBigRightDash = ArrowBigRightDash;
  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;


  protected readonly BUTTON_EDIT = BUTTON_EDIT;
  protected readonly APP_VERSION = APP_VERSION;
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
