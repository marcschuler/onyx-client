import {Component, Input} from '@angular/core';
import {ContextMenu} from '../../ui/context/context-menu/context-menu';
import {ContextMenuButton} from '../../ui/context/context-menu-button/context-menu-button';
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {CircleSlashedIcon, UserIcon, UserXIcon} from 'lucide-angular';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {RestService} from '../../../services/rest-service';
import {ProfileImage} from '../profile-image/profile-image';
import {SlicePipe} from '@angular/common';

@Component({
  selector: 'app-client-context-menu',
  imports: [
    ContextMenu,
    ContextMenuButton,
    ProfileImage,
    SlicePipe,
  ],
  templateUrl: './client-context-menu.html',
  styleUrl: './client-context-menu.css',
})
export class ClientContextMenu {

  @Input() client!: Client;
  @Input() connection!: WebSocketServerConnection;

  constructor(private toastService: ToastService, private restService: RestService) {
  }

  protected kickClientFromChannel() {
    this.connection.rest.userController.kickFromChannel(this.client.id, {})
      .subscribe(() => {
        this.toastService.create({
          type: ToastType.Success,
          title: "Client '" + this.client.username + "' kicked"
        });
      }, error => this.restService.handleError(error));
  }

  protected kickClientFromServer() {
    this.connection.rest.userController.kickFromServer(this.client.id, {})
      .subscribe(() => {
        this.toastService.create({
          type: ToastType.Success,
          title: "Client '" + this.client.username + "' kicked"
        });
      }, error => this.restService.handleError(error));
  }


  protected readonly CircleSlashedIcon = CircleSlashedIcon;
  protected readonly UserXIcon = UserXIcon;
  protected readonly UserIcon = UserIcon;
}
