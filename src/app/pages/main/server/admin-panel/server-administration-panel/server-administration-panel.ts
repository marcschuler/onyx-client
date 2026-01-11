import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Spinner} from "../../../../../components/ui/spinner/spinner";
import {RestService} from '../../../../../services/rest-service';
import {ToastService, ToastType} from '../../../../../services/toast-service';
import {ServerDTO} from '../../../../../../api/webrtc-server/model/serverDTO';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';

@Component({
  selector: 'app-server-administration-panel',
  imports: [
    ReactiveFormsModule,
    Spinner,
    FormsModule
  ],
  templateUrl: './server-administration-panel.html',
  styleUrl: './server-administration-panel.css'
})
export class ServerAdministrationPanel {

  @Input() connection!: WebSocketServerConnection;

  server: ServerDTO | undefined;

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }


  ngOnChanges() {
    this.update();
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    const data = this.connection.data;
    if (this.connection.data == undefined) {
      console.warn("Got no server tree?");
      console.warn(this.connection);
      console.warn(this.connection.data)
      console.warn(data);
      return;
    }
    this.connection.rest.serverController.get(this.connection.data.server.id)
      .subscribe(server => {
        this.server = server;
        console.log("got server " + JSON.stringify(server))
      }, error => {
        this.restService.handleError(error);
      })
  }

  saveServerInfo() {
    if (!this.server) {
      console.warn("No server dto avaiable - this should not happen");
      return;
    }
    this.connection.rest.serverController.edit(this.server.id, {
      name: this.server.name,
      description: this.server.description,
    }).subscribe(server => {
      this.server = server;
      this.toastService.create({
        title: "Server updated",
        message: "",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error));
  }
}
