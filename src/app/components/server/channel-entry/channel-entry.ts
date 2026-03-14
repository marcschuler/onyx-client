import {Component, Input} from '@angular/core';
import {HexagonIcon, LogInIcon, LogOutIcon, LucideAngularModule} from "lucide-angular";
import {ChannelDTO, ClientChannelChangeRequest} from '../../../../api/webrtc-server';
import {ServerObjectId, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {InterfaceService} from '../../../services/interface-service';
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
              protected interfaceService: InterfaceService,
              protected contextMenuService: ContextMenuService,) {

  }


  changeChannel(channel: ChannelDTO | undefined) {
    console.log("Changing channel to " + (channel ? channel.name : "(none)"));
    this.selectChannel(channel);
    this.webSocketService.send(this.connection, {
      channelId: (channel ? channel.id : undefined),
      type: ClientChannelChangeRequest.TypeEnum.ClientChannelChangeRequest
    } as ClientChannelChangeRequest);
  }


  protected selectChannel(channel: ChannelDTO | undefined) {
    if (channel == undefined) {
      console.log("Unselecting channel")
      this.connection.selectedChannel = undefined;
    } else {
      console.log("Selecting channel " + channel.name)
      this.connection.selectedChannel = channel.id as ServerObjectId;
    }
  }


  protected readonly LogOutIcon = LogOutIcon;
  protected readonly HexagonIcon = HexagonIcon;
  protected readonly LogInIcon = LogInIcon;
}
