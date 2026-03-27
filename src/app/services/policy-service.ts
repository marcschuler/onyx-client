import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {


  public buildPermissionList(): PermissionListHeader[] {
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
        },
          {
            name: "Delete",
            type: PermissionType.CHANNEL_DELETE,
            description: "Delete the channel"
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

export enum PermissionType {
  

  CHANNEL = "CHANNEL",
  CHANNEL_JOIN = "CHANNEL_JOIN",
  CHANNEL_EDIT = "CHANNEL_EDIT",
  CHANNEL_EDIT_TITLE = "CHANNEL_EDIT_TITLE",
  CHANNEL_EDIT_DESCRIPTION = "CHANNEL_EDIT_DESCRIPTION",
  CHANNEL_EDIT_AVATAR = "CHANNEL_EDIT_AVATAR",
  CHANNEL_DELETE = "CHANNEL_DELETE",
}

