import { Component, Input, inject } from '@angular/core';
import {AsyncPipe, NgClass} from "@angular/common";
import {IdenticonPipe} from "../../../pipes/identicon-pipe";
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {StorageService} from '../../../services/storage.service';
import {RestService} from '../../../services/rest-service';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {PreviewImage} from '../../ui/preview-image/preview-image';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {ProfileImage} from '../../client/profile-image/profile-image';

@Component({
  selector: 'app-user-entry',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    NgClass,
    StorageFileURLPipe,
    PreviewImage,
    ProfileImage
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry {
  protected interfaceService = inject(StorageService);
  private restService = inject(RestService);


  @Input() client!: Client;
  @Input() connection!:WebSocketServerConnection;

  constructor(protected contextMenuService: ContextMenuService,) {
  }

}
