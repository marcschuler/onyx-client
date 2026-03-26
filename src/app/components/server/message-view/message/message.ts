import {Component, Input} from '@angular/core';
import { MessageDTO } from "../../../../../api/webrtc-server";
import {AsyncPipe, NgClass} from '@angular/common';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {UserDatePipe} from '../../../../pipes/user-date-pipe';
import {InterfaceService, InterfaceSettings} from '../../../../services/interface-service';
import {Tooltip} from '../../../../directives/tooltip';

@Component({
  selector: 'app-message',
  imports: [
    NgClass,
    IdenticonPipe,
    AsyncPipe,
    MarkdownPipe,
    UserDatePipe,
    Tooltip
  ],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  @Input() message!: MessageDTO;
  @Input() useHeader!: boolean;

  @Input() connection!: WebSocketServerConnection;

  constructor(protected interfaceService: InterfaceService) {
  }

}
