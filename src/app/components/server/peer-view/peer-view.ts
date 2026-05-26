import {Component, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState} from '../../../services/peer/PeerConnection';
import {
  CircleXIcon,
  LoaderIcon,
  LucideAngularModule,
  PowerOffIcon
} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';

@Component({
  selector: 'app-peer-view',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './peer-view.html',
  styleUrl: './peer-view.css'
})
export class PeerView {

  @Input() peer!: PeerConnection | undefined;

  @Input() localStream: MediaStream | undefined;
  @Input() connection!: WebSocketServerConnection;

  protected readonly PeerConnectionState = PeerConnectionState;
  protected readonly LoaderIcon = LoaderIcon;
  protected readonly PowerOffIcon = PowerOffIcon;
  protected readonly CircleXIcon = CircleXIcon;
}
