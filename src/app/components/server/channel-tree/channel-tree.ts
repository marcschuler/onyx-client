import {Component} from '@angular/core';
import {FolderClosedIcon, HexagonIcon, LogInIcon, LucideAngularModule, MicOffIcon} from 'lucide-angular';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {Spinner} from '../../ui/spinner/spinner';
import {Channel} from '../../../services/websocket/WebSocketServerConnection';
import {ClientChannelChangeRequest, EventType} from '../../../services/websocket/WebSocketEvents';

@Component({
  selector: 'app-channel-tree',
  imports: [
    LucideAngularModule,
    Spinner
  ],
  templateUrl: './channel-tree.html',
  styleUrl: './channel-tree.css'
})
export class ChannelTree {

  readonly FolderClosedIcon = FolderClosedIcon;
  readonly MicOffIcon = MicOffIcon;
  readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService: WebSocketService) {

  }

  protected readonly LogInIcon = LogInIcon;

  changeChannel(channel: Channel) {
    console.log("Changing channel to " + channel.name);
    this.webSocketService.sendToServer(this.webSocketService.connection!, {
      channelId: channel.id,
      type: EventType.ClientChannelChangeRequest
    } as ClientChannelChangeRequest);
  }
}
