import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {GroupDTO, UserExtendedDTO} from '../../../../../api/webrtc-server';
import {RestService} from '../../../../services/rest-service';
import {ButtonPanel, TabPanelEntry} from '../../../../components/ui/button-panel/button-panel';
import {AsyncPipe, DatePipe} from '@angular/common';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {Ban, CircleSlash, LucideAngularModule, UserCheck, UserMinus, UserPlus} from 'lucide-angular';
import {ToastService, ToastType} from '../../../../services/toast-service';
import {replaceInList} from '../../../../util';

@Component({
  selector: 'app-users-panel',
  imports: [
    ButtonPanel,
    AsyncPipe,
    IdenticonPipe,
    DatePipe,
    LucideAngularModule
  ],
  templateUrl: './users-panel.html',
  styleUrl: './users-panel.css',
})
export class UsersPanel implements OnInit {
  BUTTON_USER_LIST: TabPanelEntry = {
    id: "USER_LIST",
    name: "User List"
  }

  @Input() connection!: WebSocketServerConnection;

  users: UserExtendedDTO[] | undefined;
  selectedOption!: TabPanelEntry;


  groups: GroupDTO[] | undefined;

  constructor(private restService: RestService, private toastService: ToastService,) {
  }

  ngOnInit(): void {
    this.connection.rest.userController.users()
      .subscribe(users => {
        this.users = users;
      }, error => this.restService.handleError(error));
    this.connection.rest.groupController.all().subscribe(groups => {
      this.groups = groups;
    }, error => this.restService.handleError(error))
  }

  protected readonly UserExtendedDTO = UserExtendedDTO;
  protected readonly UserCheck = UserCheck;
  protected readonly UserMinus = UserMinus;
  protected readonly UserPlus = UserPlus;

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
          title: "Group removed from user " + user.username,
          type: ToastType.Success
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
          title: "Group added to user " + user.username,
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
    this.connection.rest.userController.ban(user.id)
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
}
