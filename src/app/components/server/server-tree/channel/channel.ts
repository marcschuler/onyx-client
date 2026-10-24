import {Component, Input, inject} from '@angular/core';
import {
  LucideDynamicIcon,
  LucideHeadphoneOff,
  LucideHeadphones,
  LucideHexagon,
  LucideIcon,
  LucideLogIn,
  LucideLogOut,
  LucideMessageSquare,
  LucideMessageSquareOff,
  LucideMessageSquareText
} from "@lucide/angular";
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
    LucideDynamicIcon,
    LucideHexagon,
    LucideLogIn,
    LucideLogOut,
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

  protected voiceIcon(channel: ChannelDTO): LucideIcon {
    switch (channel.voiceMode) {
      case ChannelDTO.VoiceModeEnum.Full:
        return LucideHeadphones;
      case ChannelDTO.VoiceModeEnum.None:
      default:
        return LucideHeadphoneOff;
    }
  }

  protected chatIcon(channel: ChannelDTO): LucideIcon {
    switch (channel.chatMode) {
      case ChannelDTO.ChatModeEnum.Full:
        return LucideMessageSquareText;
      case ChannelDTO.ChatModeEnum.Temporary:
        return LucideMessageSquare;
      case ChannelDTO.ChatModeEnum.None:
      default:
        return LucideMessageSquareOff;
    }
  }

  protected selectChannel(channel: ChannelDTO) {
    this.connection.selectedChannel = channel.id as ServerObjectId;
  }
}
