import {Component, Input} from '@angular/core';
import {Client} from '../../../services/websocket/WebSocketServerConnection';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-client-about',
  imports: [
    JsonPipe
  ],
  templateUrl: './client-about.html',
  styleUrl: './client-about.css',
})
export class ClientAbout {

  @Input() client!: Client;

}
