import {Component, Input} from '@angular/core';
import {GroupDTO} from '../../../../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';
import {FormsModule} from '@angular/forms';
import {PermissionListHeader, PolicyService} from '../../../../../../services/policy-service';

@Component({
  selector: 'app-policy-panel',
  imports: [
    FormsModule
  ],
  templateUrl: './policy-panel.html',
  styleUrl: './policy-panel.css',
})
export class PolicyPanel {
  @Input() group!: GroupDTO;
  @Input() groups!: GroupDTO[];
  @Input() connection!: WebSocketServerConnection;

  permissionList: PermissionListHeader[];

  constructor(private policyService: PolicyService) {
    this.permissionList = policyService.buildPermissionList();
  }
}


export enum PermissionType {
  CHANNEL = "CHANNEL",
  CHANNEL_JOIN = "CHANNEL_JOIN",
  CHANNEL_EDIT = "CHANNEL_EDIT",
  CHANNEL_EDIT_TITLE = "CHANNEL_EDIT_TITLE",
  CHANNEL_EDIT_DESCRIPTION = "CHANNEL_EDIT_DESCRIPTION",
  CHANNEL_EDIT_AVATAR = "CHANNEL_EDIT_AVATAR",
  CHANNEL_DELETE = "CHANNEL_DELETE",
}


