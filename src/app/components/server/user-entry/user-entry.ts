import { Component, Input, inject } from '@angular/core';
import {NgClass} from "@angular/common";
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {StorageService} from '../../../services/storage.service';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {ProfileImage} from '../../client/profile-image/profile-image';

@Component({
  selector: 'app-user-entry',
  imports: [
    NgClass,
    ProfileImage
  ],
  templateUrl: './user-entry.html',
  styleUrl: './user-entry.css',
})
export class UserEntry {
  protected interfaceService = inject(StorageService);


  @Input() client!: Client;
  @Input() connection!:WebSocketServerConnection;

  constructor(protected contextMenuService: ContextMenuService,) {
  }

}
