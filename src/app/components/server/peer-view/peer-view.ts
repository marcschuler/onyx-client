import {Component, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState} from '../../../services/peer/PeerConnection';
import {CheckCheckIcon, CheckIcon, LoaderIcon, LucideAngularModule, SignalIcon} from 'lucide-angular';

@Component({
  selector: 'app-peer-view',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './peer-view.html',
  styleUrl: './peer-view.css'
})
export class PeerView {

  @Input() peer!: PeerConnection;

  protected readonly PeerConnectionState = PeerConnectionState;
  protected readonly LoaderIcon = LoaderIcon;
  protected readonly CheckIcon = CheckIcon;
  protected readonly CheckCheckIcon = CheckCheckIcon;
  protected readonly SignalIcon = SignalIcon;
}
