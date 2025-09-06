import { Component } from '@angular/core';
import {ChannelTree} from '../../../components/server/channel-tree/channel-tree';
import {UserPanel} from '../../../components/server/user-panel/user-panel';

@Component({
  selector: 'app-server',
  imports: [
    ChannelTree,
    UserPanel
  ],
  templateUrl: './server.html',
  styleUrl: './server.css'
})
export class Server {

}
