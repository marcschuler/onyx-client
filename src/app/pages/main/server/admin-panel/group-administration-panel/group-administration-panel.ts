import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {GroupDTO, PermissionDTO} from '../../../../../../api/webrtc-server';
import {RestService} from '../../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';
import {ToastService, ToastType} from '../../../../../services/toast-service';
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
export class GroupAdministrationPanel implements OnInit {

  @Input() connection!: WebSocketServerConnection;

  groups: GroupDTO[] | undefined;

  selectedGroup: GroupDTO | undefined;

  permissionsEnumValues: string[];

  constructor(private restService: RestService,
              private toastService: ToastService) {
    this.permissionsEnumValues = Object.values(PermissionsEnum);
  }

  ngOnInit(): void {
    this.connection.rest.groupController.all()
      .subscribe(value => {
        this.groups = value;
        if (!this.selectedGroup && value.length > 0)
          this.selectedGroup = value[0];
      }, error => this.restService.handleError(error));
  }

  groupFromParentId(id: string) {
    return this.groups?.filter(g => g.id == id)[0];
  }

  deleteGroup(group: GroupDTO) {
    this.connection.rest.groupController.delete2(group.id).subscribe(value => {
      this.toastService.create({
        type: ToastType.Success,
        title: 'Group ' + group.name + ' deleted'
      })
      this.groups?.splice(this.groups?.indexOf(group), 1)
      if (group == this.selectedGroup)
        this.selectedGroup = undefined;
    }, error => this.restService.handleError(error));
  }

  updateGroup(group: GroupDTO) {
    this.connection.rest.groupController.edit3(group.id, group).subscribe(value => {
      this.toastService.create({
        type: ToastType.Success,
        title: 'Group ' + value.name + ' updated'
      });
    }, error => this.restService.handleError(error))

  }

  protected readonly IdCardLanyard = IdCardLanyard;

  protected addGroup() {
    this.connection.rest.groupController.create2({
      name: findFreeName("Group", (this.groups || []).map(g => g.name)),
      description: "",
      defaultForNewUsers: false
    }).subscribe(value => {
      this.groups?.push(value);
      this.selectedGroup = value;
    }, error => this.restService.handleError(error));
  }

  protected addPermission() {
    this.selectedGroup!.permissions!.push({
      negated: false,
      id: "",
      permissions: [],
      limitedToChannel: [],
      limitedToSection: []
    });
  }

  protected deletePermission(permission: PermissionDTO) {
    const index = this.selectedGroup!.permissions!.indexOf(permission);
    this.selectedGroup!.permissions!.splice(index, 1);

  }
}
