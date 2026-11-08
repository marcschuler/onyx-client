import {Component, inject, Input} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {FormsModule} from '@angular/forms';
import {RestService} from '../../../../../services/rest/rest-service';
import {ToastService, ToastType} from '../../../../../services/ui/toast-service';

@Component({
  selector: 'app-security-panel',
  imports: [
    FormsModule
  ],
  templateUrl: './security-panel.html',
  styleUrl: './security-panel.css',
})
export class SecurityPanel {
  @Input() connection!: WebSocketServerConnection;

  protected restService = inject(RestService);
  protected toastService = inject(ToastService);

  protected password: string = "";

  savePassword() {
    const password = this.password == "" ? undefined : this.password;
    this.connection.rest.serverController.setPassword(this.connection.server.info.id, {
      password: password
    }).subscribe(() => {
      this.toastService.create({
        type: ToastType.Success,
        title: "Server password changed",
        message: "Server password has been " + (password ? "added" : "removed")
      })
    }, error => this.restService.handleError(error))
  }
}
