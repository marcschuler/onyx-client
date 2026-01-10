import {Component, OnDestroy, OnInit} from '@angular/core';
import {Spinner} from '../../../components/ui/spinner/spinner';
import {
  ServerConnection,
  ServerLoaderService
} from '../../../services/server-loader-service';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule, ServerIcon, ServerOffIcon, SettingsIcon, UserIcon} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {IdentityService} from '../../../services/identity-service';
import {Popup} from '../../../components/ui/popup/popup';
import {Settings} from '../../settings/settings';
import {KeyVisualizer} from '../../../components/ui/key-visualizer/key-visualizer';
import {ServerDTO} from '../../../../api/webrtc-server/model/serverDTO';

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

  CONNECTING_STATE: ServerInfoWithState ={
    error: undefined,
    success: undefined,
    state: ServerInfoState.CONNECTING
  }


  showSettings: boolean = false;


  selectedServer: ServerConnection | undefined;

  serverDetails: Map<ServerConnection, ServerInfoWithState> = new Map();

  customUrl: string = "";
  customUrlError: string | undefined;

  private interval!: number;

  constructor(protected serverLoaderService: ServerLoaderService,
              private webSocketService: WebSocketService,
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
          console.log("server-selector: error", error);
          this.serverDetails.set(connection, {
            state: ServerInfoState.ERROR,
            success: undefined,
            error: error
          });
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
      .then(serverDetail => {
        this.connect(server)
      })
      .catch(error => {
        console.log("new server not available: " + error);
        //TODO show error to user
        this.customUrlError = error.error;
      })
  }

  connect(server: ServerConnection) {
    this.selectedServer = server;
    this.webSocketService.connect(server, this.identityService.defaultIdentity())
      .then(c => this.selectedServer = undefined)
      .catch(e => this.selectedServer = undefined);
  }


  removeServer(s: ServerConnection) {
    this.serverLoaderService.removeServer(s);

  }

  protected readonly ServerIcon = ServerIcon;
  protected readonly UserIcon = UserIcon;
  protected readonly ServerInfoState = ServerInfoState;
  protected readonly ServerOffIcon = ServerOffIcon;
  protected readonly SettingsIcon = SettingsIcon;
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
