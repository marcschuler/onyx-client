import { Component } from '@angular/core';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {JsonPipe} from '@angular/common';
import {IdentityService} from '../../../services/identity-service';
import {PeerConnectionService} from '../../../services/peer/peer-connection-service';
import {APP_VERSION, isElectron} from '../../../services/Util';

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

  protected readonly APP_VERSION = APP_VERSION;
  protected readonly isElectron = isElectron;
}
