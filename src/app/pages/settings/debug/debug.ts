import { Component, inject } from '@angular/core';
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
  protected webSocketService = inject(WebSocketService);
  protected peerConnectionService = inject(PeerConnectionService);
  protected identityService = inject(IdentityService);


  protected readonly APP_VERSION = APP_VERSION;
  protected readonly isElectron = isElectron;
}
