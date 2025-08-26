import {Component} from '@angular/core';
import {Spinner} from '../../../components/ui/spinner/spinner';
import {
  ServerConnection,
  ServerDetail,
  ServerDetailError,
  ServerLoaderService
} from '../../../services/server-loader-service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-server-selector',
  imports: [
    Spinner,
    FormsModule
  ],
  templateUrl: './server-selector.html',
  styleUrl: './server-selector.css'
})
export class ServerSelector {

  selectedServer: ServerConnection | undefined;

  serverDetails: Map<ServerConnection, ServerDetail | ServerDetailError> = new Map();

  customUrl: string = "";
  customUrlError: string |undefined;

  constructor(protected serverLoaderService: ServerLoaderService) {
    this.updateDetails();
    setInterval(() => this.updateDetails(), 10000);
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
    setTimeout(() => this.selectedServer = undefined, 5000);
  }


}
