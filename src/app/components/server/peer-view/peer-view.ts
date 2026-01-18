import {Component, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState, SecurityState} from '../../../services/peer/PeerConnection';
import {
  CircleXIcon,
  LoaderIcon,
  LucideAngularModule,
  PowerOffIcon, ShieldAlert, ShieldOff,
  SignalIcon
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
  @Input() connection!:WebSocketServerConnection;

  protected readonly PeerConnectionState = PeerConnectionState;
  protected readonly LoaderIcon = LoaderIcon;
  protected readonly SignalIcon = SignalIcon;
  protected readonly PowerOffIcon = PowerOffIcon;
  protected readonly CircleXIcon = CircleXIcon;
  protected readonly SecurityState = SecurityState;
  protected readonly ShieldAlert = ShieldAlert;
  protected readonly ShieldOff = ShieldOff;
}
