import {Component, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState} from '../../../services/peer/PeerConnection';
import {
  CircleXIcon,
  LoaderIcon,
  LucideAngularModule,
  PowerOffIcon,
  SignalIcon
} from 'lucide-angular';

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

  protected readonly PeerConnectionState = PeerConnectionState;
  protected readonly LoaderIcon = LoaderIcon;
  protected readonly SignalIcon = SignalIcon;
  protected readonly PowerOffIcon = PowerOffIcon;
  protected readonly CircleXIcon = CircleXIcon;
}
