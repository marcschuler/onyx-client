import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ButtonPanel, TabPanelEntry} from '../../../../components/ui/button-panel/button-panel';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {ServerDTO} from '../../../../../api/webrtc-server/model/serverDTO';
import {ToastService, ToastType} from '../../../../services/toast-service';

@Component({
  selector: 'app-admin-panel',
  imports: [ButtonPanel, FormsModule, Spinner],
  templateUrl: './admin-panel.html',
  standalone: true,
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit, OnChanges {


  @Input() connection!: WebSocketServerConnection;

  server: ServerDTO | undefined;

  BUTTON_SERVER_ADMINISTRATION: TabPanelEntry = {
    name: "Server Administration"
  }

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
