import { Component } from '@angular/core';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {JsonPipe} from '@angular/common';
import {IdentityService} from '../../../services/identity-service';
import {PeerConnectionService} from '../../../services/peer/peer-connection-service';

@Component({
  selector: 'app-debug',
  imports: [
    JsonPipe
  ],
  templateUrl: './debug.html',
  styleUrl: './debug.css'
})
export class Debug {

  constructor(protected webSocketService: WebSocketService,
              protected peerConnectionService: PeerConnectionService,
              protected identityService: IdentityService,) {
  }

}
