import {Component, Input} from '@angular/core';
import {GroupDTO} from '../../../../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';
import {FormsModule} from '@angular/forms';

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

  permissionList: PermissionListHeader[] = [
    {
      name: "Channel",
      items: [{
        name: "General",
        type: PermissionType.CHANNEL,
        description: "General Channel permission"
      }, {
        name: "Join",
        type: PermissionType.CHANNEL_JOIN,
        description: "Joining a channel",
      }]
    }
  ]

  constructor() {
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


export interface PermissionListHeader {
  name: string;
  items: PermissionListItem[];
}

export interface PermissionListItem {
  name: string;
  type: PermissionType;
  description: string;
  defaultValue?: string;
  defaultValueReason?: string;
}
