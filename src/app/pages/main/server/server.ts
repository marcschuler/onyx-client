import { Component } from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';
import {ChannelView} from './channel-view/channel-view';
import {WebSocketService} from '../../../services/websocket/web-socket-service';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel,
    ChannelView
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {

  constructor(protected webSocketService:WebSocketService) {
  }

}
