import {Component, Input} from '@angular/core';
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {AsyncPipe} from '@angular/common';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {PreviewImage} from '../../ui/preview-image/preview-image';

@Component({
  selector: 'app-profile-image',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    PreviewImage
  ],
  templateUrl: './profile-image.html',
  styleUrl: './profile-image.css',
})
export class ProfileImage {

  @Input() client!: Client;
  @Input() connection!: WebSocketServerConnection;
  @Input() size: number = 8;

  constructor() {
  }

}
