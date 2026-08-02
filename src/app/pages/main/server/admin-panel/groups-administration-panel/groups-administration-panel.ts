import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {ToastService, ToastType} from '../../../../../services/ui/toast-service';
import {RestService} from '../../../../../services/rest-service';
import {GroupDTO} from '../../../../../../api/onyx-server';

@Component({
  selector: 'app-groups-administration-panel',
  imports: [
    FormsModule
  ],
  templateUrl: './groups-administration-panel.html',
  styleUrl: './groups-administration-panel.css',
})
export class GroupsAdministrationPanel {

  private toastService = inject(ToastService);
  private restService = inject(RestService);

  @Input() connection!: WebSocketServerConnection;

  @Output() onGroupCreated = new EventEmitter<GroupDTO>();


  protected groupName: string = "";

  protected createGroup() {
    this.connection.rest.groupController.create1({
      name: this.groupName,
      label: false,
      defaultForNewUsers: false,
      description: ""
    }).subscribe((group) => {
      this.toastService.create({
        title: "Group created",
        type: ToastType.Success
      })
      this.groupName = "";
      this.onGroupCreated.emit(group)
    }, error => this.restService.handleError(error));
  }
}
