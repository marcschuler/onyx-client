import {Component, inject, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState} from '../../../services/peer/PeerConnection';
import {
  CircleXIcon,
  LoaderIcon,
  LucideAngularModule,
  PowerOffIcon
} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {TrackMetadataMessage} from '../../../../api/webrtc-server';
import {DebugService} from '../../../services/debug-service';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-peer-view',
  imports: [
    LucideAngularModule,
    JsonPipe
  ],
  templateUrl: './peer-view.html',
  styleUrl: './peer-view.css'
})
export class PeerView {

  @Input() peer: PeerConnection | undefined;
  @Input() stream!: MediaStream;
  @Input() streamType: TrackMetadataMessage.LabelEnum | undefined;
  @Input() connection!: WebSocketServerConnection;

  protected contextMenuService = inject(ContextMenuService);
  protected debugService = inject(DebugService);

  protected readonly PeerConnectionState = PeerConnectionState;
  protected readonly LoaderIcon = LoaderIcon;
  protected readonly PowerOffIcon = PowerOffIcon;
  protected readonly CircleXIcon = CircleXIcon;

  protected openClientContextMenu($event: PointerEvent) {
    if (this.peer)
      this.contextMenuService.openClientContextMenu(this.peer.client, this.connection, $event)
  }
}
