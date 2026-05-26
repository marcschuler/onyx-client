import {Component, Input} from '@angular/core';
import {HexagonIcon, LogInIcon, LogOutIcon, LucideAngularModule} from "lucide-angular";
import {
  ChannelDTO,
  ClientChannelJoinEvent,
  ClientChannelJoinRequest,
  ClientChannelLeaveRequest
} from '../../../../api/webrtc-server';
import {ServerObjectId, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {StorageService} from '../../../services/storage.service';
import {ContextMenuService} from '../../../services/context-menu-service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-channel-entry',
  imports: [
    LucideAngularModule,
    NgClass
  ],
  templateUrl: './channel-entry.html',
  styleUrl: './channel-entry.css',
})
export class ChannelEntry {

  @Input() channel!: ChannelDTO;
  @Input() connection!: WebSocketServerConnection;

  constructor(private webSocketService: WebSocketService,
              protected interfaceService: StorageService,
              protected contextMenuService: ContextMenuService,) {

  }


  protected joinChannel(channel: ChannelDTO) {
    console.log("trying to join channel", channel);
    this.webSocketService.send(this.connection, {
      channelId: (channel ? channel.id : undefined),
      type: ClientChannelJoinRequest.TypeEnum.ClientChannelJoinRequest
    } as ClientChannelJoinRequest);
  }

  protected leaveChannel() {
    console.log("leaving channel");
    this.webSocketService.send(this.connection, {
      type: "ClientChannelLeaveRequest"
    } as ClientChannelLeaveRequest)
  }


  protected readonly LogOutIcon = LogOutIcon;
  protected readonly HexagonIcon = HexagonIcon;
  protected readonly LogInIcon = LogInIcon;


  protected selectChannel(channel: ChannelDTO) {
    this.connection.selectedChannel = channel.id as ServerObjectId;
  }
}
