import {Component, OnDestroy, OnInit} from '@angular/core';
import {Spinner} from '../../../components/ui/spinner/spinner';
import {
  ServerConnection,
  ServerInfo,
  ServerDetailError,
  ServerLoaderService
} from '../../../services/server-loader-service';
import {FormsModule} from '@angular/forms';
import {ImageIcon, LucideAngularModule, ServerIcon, UserIcon} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {IdentityService} from '../../../services/identity-service';

@Component({
  selector: 'app-server-selector',
  imports: [
    Spinner,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './server-selector.html',
  styleUrl: './server-selector.css'
})
export class ServerSelector implements OnInit,OnDestroy{


  selectedServer: ServerConnection | undefined;

  serverDetails: Map<ServerConnection, ServerInfo | ServerDetailError> = new Map();

  customUrl: string = "";
  customUrlError: string | undefined;

  private interval!:number;

  constructor(protected serverLoaderService: ServerLoaderService,
              private webSocketService: WebSocketService,
              private identityService: IdentityService) {

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
          this.serverDetails.set(connection, serverDetail);
        })
        .catch(error => {
          this.serverDetails.set(connection, error as ServerDetailError);
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
    this.webSocketService.connect(server, this.identityService.defaultIdentity());
    setTimeout(() => this.selectedServer = undefined, 5000);
  }


  removeServer(s: ServerConnection) {
    this.serverLoaderService.removeServer(s);

  }

  protected readonly ServerIcon = ServerIcon;
  protected readonly UserIcon = UserIcon;
}
