import {Component, Input, inject} from '@angular/core';
import {
  HeadphoneOffIcon,
  HeadphonesIcon,
  HexagonIcon,
  LogInIcon,
  LogOutIcon,
  LucideAngularModule, MessageSquareIcon, MessageSquareOffIcon, MessageSquareTextIcon
} from "lucide-angular";
import {
  ChannelDTO,
  ClientChannelJoinRequest,
  ClientChannelLeaveRequest
} from '../../../../../api/onyx-server';
import {ServerObjectId, WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {StorageService} from '../../../../services/storage.service';
import {ContextMenuService} from '../../../../services/ui/context-menu-service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-channel',
  imports: [
    LucideAngularModule,
    NgClass
  ],
  templateUrl: './channel.html',
  styleUrl: './channel.css',
})
export class Channel {
  private webSocketService = inject(WebSocketService);
  protected interfaceService = inject(StorageService);
  protected contextMenuService = inject(ContextMenuService);


  @Input() channel!: ChannelDTO;
  @Input() connection!: WebSocketServerConnection;


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

  protected voiceIcon(channel: ChannelDTO) {
    switch (channel.voiceMode) {
      case ChannelDTO.VoiceModeEnum.Full:
        return HeadphonesIcon;
      case ChannelDTO.VoiceModeEnum.None:
      default:
        return HeadphoneOffIcon;
    }
  }

  protected chatIcon(channel: ChannelDTO) {
    switch (channel.chatMode) {
      case ChannelDTO.ChatModeEnum.Full:
        return MessageSquareTextIcon;
      case ChannelDTO.ChatModeEnum.Temporary:
        return MessageSquareIcon;
      case ChannelDTO.ChatModeEnum.None:
      default:
        return MessageSquareOffIcon;
    }
  }

  protected selectChannel(channel: ChannelDTO) {
    this.connection.selectedChannel = channel.id as ServerObjectId;
  }

  protected readonly LogOutIcon = LogOutIcon;
  protected readonly HexagonIcon = HexagonIcon;
  protected readonly LogInIcon = LogInIcon;
  protected readonly HeadphonesIcon = HeadphonesIcon;
  protected readonly HeadphoneOffIcon = HeadphoneOffIcon;
  protected readonly MessageSquareOffIcon = MessageSquareOffIcon;
  protected readonly MessageSquareIcon = MessageSquareIcon;
  protected readonly MessageSquareTextIcon = MessageSquareTextIcon;
}
