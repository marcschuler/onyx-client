import {Component, Input} from '@angular/core';
import {AsyncPipe, NgClass} from "@angular/common";
import {IdenticonPipe} from "../../../pipes/identicon-pipe";
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {UserSimpleDTO} from '../../../../api/webrtc-server';
import {InterfaceService} from '../../../services/interface-service';

@Component({
  selector: 'app-user-entry',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    NgClass
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry {

  @Input() user!: UserSimpleDTO;
  @Input() connection!:WebSocketServerConnection;

  constructor(protected interfaceService: InterfaceService) {

  }

}
