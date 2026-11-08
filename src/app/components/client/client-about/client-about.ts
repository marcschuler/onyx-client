import {Component, Input} from '@angular/core';
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {KeyVisualizer} from '../../ui/key-visualizer/key-visualizer';
import {Chip} from '../../ui/chip/chip';
import {ProfileImage} from '../profile-image/profile-image';
import {UserSimpleDTO} from '../../../../api/onyx-server';
import {LucideHexagon} from '@lucide/angular';
import {SlicePipe} from '@angular/common';

@Component({
  selector: 'app-client-about',
  imports: [
    KeyVisualizer,
    Chip,
    ProfileImage,
    LucideHexagon,
    SlicePipe
  ],
  templateUrl: './client-about.html',
  styleUrl: './client-about.css',
})
export class ClientAbout {

  @Input() user!: UserSimpleDTO;
  @Input() connection!: WebSocketServerConnection;

  /** the online client of this user, undefined if the user is offline */
  protected get client(): Client | undefined {
    return this.connection.client(this.user.id);
  }
}
