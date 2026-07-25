import {Component, Input, OnInit, inject, EventEmitter, Output} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {GroupDTO, PermissionDTO} from '../../../../../../api/webrtc-server';
import {RestService} from '../../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';
import {ToastService, ToastType} from '../../../../../services/ui/toast-service';
import {findFreeName} from '../../../../../services/Util';
import {Toggle} from '../../../../../components/ui/toggle/toggle';
import {MultiSelect} from '../../../../../components/ui/multi-select/multi-select';
import PermissionsEnum = PermissionDTO.PermissionsEnum;
import {SelectItem} from '../../../../../components/ui/multi-select/select-item/select-item';

@Component({
  selector: 'app-group-administration-panel',
  imports: [
    FormsModule,
    LucideAngularModule,
    Toggle,
    MultiSelect,
    SelectItem
  ],
  templateUrl: './group-administration-panel.html',
  styleUrl: './group-administration-panel.css',
})
export class GroupAdministrationPanel {
  private restService = inject(RestService);
  private toastService = inject(ToastService);


  @Input() connection!: WebSocketServerConnection;
  @Input() group!: GroupDTO;
  @Input() groups!: GroupDTO[];
  @Output() groupsChange = new EventEmitter<GroupDTO[]>();

  permissionsEnumValues: string[];

  constructor() {
    this.permissionsEnumValues = Object.values(PermissionsEnum);
  }

  groupFromParentId(id: string) {
    //return this.groups?.filter(g => g.id == id)[0];
  }

  deleteGroup() {
    this.connection.rest.groupController.delete1(this.group.id).subscribe(value => {
      this.toastService.create({
        type: ToastType.Success,
        title: 'Group ' + this.group.name + ' deleted'
      })
      this.groups?.splice(this.groups.indexOf(this.group), 1);
    }, error => this.restService.handleError(error));
  }

  updateGroup() {
    this.connection.rest.groupController.edit2(this.group.id, this.group).subscribe(value => {
      this.toastService.create({
        type: ToastType.Success,
        title: 'Group ' + value.name + ' updated'
      });
    }, error => this.restService.handleError(error))

  }

  protected readonly IdCardLanyard = IdCardLanyard;

  /*protected addGroup() {
    this.connection.rest.groupController.create2({
      name: findFreeName("Group", (this.groups || []).map(g => g.name)),
      description: "",
      defaultForNewUsers: false,
      label: false
    }).subscribe(value => {
      this.groups?.push(value);
      this.selectedGroup = value;
    }, error => this.restService.handleError(error));
  } TODO */

  protected addPermission() {
    this.group!.permissions!.push({
      inverted: false,
      id: "",
      permissions: [],
      limitedToChannel: [],
      limitedToSection: []
    });
  }

  protected deletePermission(permission: PermissionDTO) {
    const index = this.group!.permissions!.indexOf(permission);
    this.group!.permissions!.splice(index, 1);
  }
}
