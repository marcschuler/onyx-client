import {Component, Input} from '@angular/core';
import {
  FolderClosedIcon,
  HexagonIcon,
  LogInIcon,
  LucideAngularModule,
  MicOffIcon,
  SettingsIcon,
  TrashIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import {Channel} from '../../../services/websocket/WebSocketServerConnection';
import {NgClass} from '@angular/common';
import {ChannelReference, ClientChannelChangeRequest} from '../../../../api/webrtc-server';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    NgClass
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {

  @Input() editMode!: boolean;

  readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService: WebSocketService) {

  }

  protected readonly LogInIcon = LogInIcon;

  changeChannel(channel: ChannelReference) {
    console.log("Changing channel to " + channel.name);
    this.webSocketService.send(this.webSocketService.connection!, {
      channelId: channel.id,
      type: ClientChannelChangeRequest.TypeEnum.ClientChannelChangeRequest
    } as ClientChannelChangeRequest);
  }

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly TrashIcon = TrashIcon;
}
