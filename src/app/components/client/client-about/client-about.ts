import {Component, Input} from '@angular/core';
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {KeyVisualizer} from '../../ui/key-visualizer/key-visualizer';
import {Chip} from '../../ui/chip/chip';
import {ProfileImage} from '../profile-image/profile-image';
import {getChannelFromId} from '../../../services/Util';
import {HexagonIcon, LucideAngularModule} from 'lucide-angular';
import {SlicePipe} from '@angular/common';

@Component({
  selector: 'app-client-about',
  imports: [
    KeyVisualizer,
    Chip,
    ProfileImage,
    LucideAngularModule,
    SlicePipe
  ],
  templateUrl: './client-about.html',
  styleUrl: './client-about.css',
})
export class ClientAbout {

  @Input() client!: Client;
  @Input() connection!: WebSocketServerConnection;

  protected readonly getChannelFromId = getChannelFromId;
  protected readonly HexagonIcon = HexagonIcon;
}
