import {Component, Input} from '@angular/core';
import {
  HexagonIcon,
  LogInIcon,
  LucideAngularModule,
  SettingsIcon,
  TrashIcon
} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import {AsyncPipe, NgClass} from '@angular/common';
import {ClientChannelChangeRequest} from '../../../../api/webrtc-server';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {ChannelDTO} from '../../../../api/webrtc-server/model/channelDTO';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner,
    NgClass,
    IdenticonPipe,
    AsyncPipe
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {

  @Input() editMode!: boolean;

  readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService: WebSocketService,) {

  }

  protected readonly LogInIcon = LogInIcon;

  changeChannel(channel: ChannelDTO) {
    console.log("Changing channel to " + channel.name);
    this.webSocketService.send(this.webSocketService.connection!, {
      channelId: channel.id,
      type: ClientChannelChangeRequest.TypeEnum.ClientChannelChangeRequest
    } as ClientChannelChangeRequest);
  }

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly TrashIcon = TrashIcon;
}
