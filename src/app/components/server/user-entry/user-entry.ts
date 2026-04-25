import {Component, Input, SimpleChanges} from '@angular/core';
import {AsyncPipe, NgClass} from "@angular/common";
import {IdenticonPipe} from "../../../pipes/identicon-pipe";
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {UserSimpleDTO} from '../../../../api/webrtc-server';
import {InterfaceService} from '../../../services/interface-service';
import {map} from 'rxjs';
import {RestService} from '../../../services/rest-service';
import {DomSanitizer} from '@angular/platform-browser';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';

@Component({
  selector: 'app-user-entry',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    NgClass,
    StorageFileURLPipe
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry {

  @Input() client!: Client;
  @Input() connection!:WebSocketServerConnection;

  avatarUrl: any| undefined = undefined;

  constructor(protected interfaceService: InterfaceService, private restService: RestService) {

  }

}
