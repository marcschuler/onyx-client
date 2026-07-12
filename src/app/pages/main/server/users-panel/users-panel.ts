import { Component, Input, OnInit, inject } from '@angular/core';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {GroupDTO, UserExtendedDTO} from '../../../../../api/webrtc-server';
import {RestService} from '../../../../services/rest-service';
import {SplitPanel, TabPanelEntry} from '../../../../components/ui/split-panel/split-panel';
import {AsyncPipe, DatePipe} from '@angular/common';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {
  Ban,
  CircleSlash,
  LucideAngularModule,
  UserCheck,
  UserMinus,
  UserMinusIcon,
  UserPlus,
  UsersIcon
} from 'lucide-angular';
import {ToastService, ToastType} from '../../../../services/toast-service';
import {replaceInList} from '../../../../util';
import {SplitPanelBar} from '../../../../components/ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../../../components/ui/split-panel/split-panel-button/split-panel-button';
import {SplitPanelSelector} from '../../../../directives/split-panel-selector';
import {Popup} from '../../../../components/ui/popup/popup';
import {ProfileImage} from '../../../../components/client/profile-image/profile-image';
import {MultiSelect} from '../../../../components/ui/multi-select/multi-select';
import {SelectItem} from '../../../../components/ui/multi-select/select-item/select-item';

@Component({
  selector: 'app-users-panel',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    DatePipe,
    LucideAngularModule,
    SplitPanel,
    SplitPanelBar,
    SplitPanelButton,
    SplitPanelSelector,
    Popup,
    ProfileImage,
    MultiSelect,
    SelectItem
  ],
  templateUrl: './users-panel.html',
  styleUrl: './users-panel.css',
})
export class UsersPanel implements OnInit {
  private restService = inject(RestService);
  private toastService = inject(ToastService);

  @Input() connection!: WebSocketServerConnection;

  users: UserExtendedDTO[] | undefined;


  groups: GroupDTO[] | undefined;

  ngOnInit(): void {
    this.connection.rest.userController.users()
      .subscribe(users => {
        this.users = users;
      }, error => this.restService.handleError(error));
    this.connection.rest.groupController.all().subscribe(groups => {
      this.groups = groups;
    }, error => this.restService.handleError(error))
  }


  protected changeGroupState(user: UserExtendedDTO, group: GroupDTO) {
    if (this.userHasGroup(user, group)) {
      this.deleteGroup(user, group);
    } else {
      this.addGroup(user, group);
    }
  }

  private deleteGroup(user: UserExtendedDTO, group: GroupDTO) {
    console.log("removing group from " + group.name + " from user")
    this.connection.rest.userController.groupsDelete(user.id, group.id)
      .subscribe(value => {
        user.groups = value;
        this.toastService.create({
          title: "Group removed",
          message: "'" + user.username + "' lost group '" + group.name + "'",
          type: ToastType.Info
        })
      }, error => {
        this.restService.handleError(error)
      });
  }

  private addGroup(user: UserExtendedDTO, group: GroupDTO) {
    console.log("adding group " + group.name + " from user")
    this.connection.rest.userController.groupsPut(user.id, group.id)
      .subscribe(value => {
        user.groups = value;
        this.toastService.create({
          title: "Group added",
          message: "'" + user.username + "' has group '" + group.name + "'",
          type: ToastType.Success
        })
      }, error => {
        this.restService.handleError(error)
      });
  }

  protected userHasGroup(user: UserExtendedDTO, group: GroupDTO) {
    return user.groups.some(g => g.id === group.id);
  }

  protected readonly Ban = Ban;
  protected readonly CircleSlash = CircleSlash;

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

  protected readonly UsersIcon = UsersIcon;
  protected readonly UserExtendedDTO = UserExtendedDTO;
  protected readonly UserCheck = UserCheck;
  protected readonly UserPlus = UserPlus;
}
