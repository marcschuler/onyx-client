import { Injectable } from '@angular/core';
import {PermissionType} from '../pages/main/server/admin-panel/group-administration-panel/policy-panel/policy-panel';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {


  public buildPermissionList():PermissionListHeader[]{
    return [
      {
        name: "Channel",
        items: [{
          name: "General",
          type: PermissionType.CHANNEL,
          description: "General permission for all channel types"
        }, {
          name: "Join",
          type: PermissionType.CHANNEL_JOIN,
          description: "Permission for joining a channel",
        }, {
          name: "Edit",
          type: PermissionType.CHANNEL_EDIT,
          description: "Edit the channel"
        }, {
          name: "Edit Title",
          type: PermissionType.CHANNEL_EDIT_TITLE,
          description: "Edit the title of the channel"
        }, {
          name: "Edit Description",
          type: PermissionType.CHANNEL_EDIT_DESCRIPTION,
          description: "Edit the description of the channel"
        }]
      }
    ]
  }

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
