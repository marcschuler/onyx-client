import {Component, Input, SimpleChanges} from '@angular/core';
import {AsyncPipe, NgClass} from "@angular/common";
import {IdenticonPipe} from "../../../pipes/identicon-pipe";
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {UserSimpleDTO} from '../../../../api/webrtc-server';
import {StorageService} from '../../../services/storage.service';
import {map} from 'rxjs';
import {RestService} from '../../../services/rest-service';
import {DomSanitizer} from '@angular/platform-browser';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {PreviewImage} from '../../ui/preview-image/preview-image';

@Component({
  selector: 'app-user-entry',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    NgClass,
    StorageFileURLPipe,
    PreviewImage
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry {

  @Input() client!: Client;
  @Input() connection!:WebSocketServerConnection;

  avatarUrl: any| undefined = undefined;

  constructor(protected interfaceService: StorageService, private restService: RestService) {

  }

}
