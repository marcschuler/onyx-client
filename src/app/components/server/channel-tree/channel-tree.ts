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
import {ServerObjectId, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';

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
  @Input() connection!: WebSocketServerConnection;

  readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService: WebSocketService,) {

  }

  protected readonly LogInIcon = LogInIcon;

  changeChannel(channel: ChannelDTO) {
    console.log("Changing channel to " + channel.name);
    this.selectChannel(channel);
    this.webSocketService.send(this.connection, {
      channelId: channel.id,
      type: ClientChannelChangeRequest.TypeEnum.ClientChannelChangeRequest
    } as ClientChannelChangeRequest);
  }

  protected selectChannel(channel: ChannelDTO | undefined) {
    if (channel == undefined) {
      console.log("unselecting channel")
      this.connection.selectedChannel = undefined;
    }else{
      console.log("Selecting channel " + channel.name)
      this.connection.selectedChannel = channel.id as ServerObjectId;
    }
  }

  protected readonly SettingsIcon = SettingsIcon;
  protected readonly TrashIcon = TrashIcon;


}
