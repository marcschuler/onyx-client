import {Component, inject, Input, OnChanges} from '@angular/core';
import {DatePipe} from "@angular/common";
import {
  CircleSlash,
  CircleSlashIcon,
  LucideAngularModule,
  UserCheck,
  UserCheckIcon,
  UserPlusIcon
} from "lucide-angular";
import {MultiSelect} from "../../../../../components/ui/multi-select/multi-select";
import {ProfileImage} from "../../../../../components/client/profile-image/profile-image";
import {SelectItem} from "../../../../../components/ui/multi-select/select-item/select-item";
import {GroupDTO, UserExtendedDTO} from '../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../../services/rest-service';
import {ToastService, ToastType} from '../../../../../services/ui/toast-service';
import {replaceInList} from '../../../../../util';

@Component({
  selector: 'app-user-entry',
  imports: [
    DatePipe,
    LucideAngularModule,
    MultiSelect,
    ProfileImage,
    SelectItem
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry implements OnChanges {


  @Input() user!: UserExtendedDTO;
  @Input() users!: UserExtendedDTO[];
  @Input() groups!: GroupDTO[];
  @Input() connection!: WebSocketServerConnection;

  private toastService = inject(ToastService);
  protected restService = inject(RestService);

  userGroups!: GroupDTO[];

  ngOnChanges(changes: any): void {
    this.initGroups();
  }

  initGroups() {
    this.userGroups = this.groups.filter(g => this.user.groups.map(g2 => g2.id).includes(g.id));
  }


  protected ban(user: UserExtendedDTO) {
    this.connection.rest.userController.ban(user.id, "") //TODO add reason
      .subscribe(value => {
        this.toastService.create({
          title: "User banned",
          type: ToastType.Success
        })
        replaceInList(this.users!, user, value);
      }, error => this.restService.handleError(error))
  }

  protected unban(user: UserExtendedDTO) {
    this.connection.rest.userController.unban(user.id)
      .subscribe(value => {
        this.toastService.create({
          title: "User set to active",
          type: ToastType.Success
        })
        replaceInList(this.users!, user, value);
      }, error => this.restService.handleError(error))
  }


  protected addGroup($event: GroupDTO) {
    console.log("adding group", $event);
    this.connection.rest.userController.groupsPut(this.user.id, $event.id)
      .subscribe(value => {

      },error=>this.restService.handleError(error))

  }

  protected removeGroup($event: GroupDTO) {
    console.log("removing group", $event);
    this.connection.rest.userController.groupsDelete(this.user.id, $event.id)
      .subscribe(value => {

      },error=>this.restService.handleError(error))
  }


  protected readonly UserExtendedDTO = UserExtendedDTO;
  protected readonly CircleSlash = CircleSlash;
  protected readonly UserCheckIcon = UserCheckIcon;
  protected readonly CircleSlashIcon = CircleSlashIcon;
  protected readonly UserPlusIcon = UserPlusIcon;

}
