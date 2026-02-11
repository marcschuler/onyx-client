import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {GroupDTO} from '../../../../../../api/webrtc-server';
import {RestService} from '../../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';
import {ToastService, ToastType} from '../../../../../services/toast-service';

@Component({
  selector: 'app-group-administration-panel',
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './group-administration-panel.html',
  styleUrl: './group-administration-panel.css',
})
export class GroupAdministrationPanel implements OnInit {

  @Input() connection!: WebSocketServerConnection;

  groups: GroupDTO[] | undefined;

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.connection.rest.groupController.all()
      .subscribe(value => {
        this.groups = value;
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

  protected readonly navigator = navigator;
  protected readonly IdCardLanyard = IdCardLanyard;

  protected addGroup() {
    this.connection.rest.groupController.create2({
      name: "Group",
      description: ""
    }).subscribe(value => {
      this.groups?.push(value);
    }, error => this.restService.handleError(error));
  }
}
