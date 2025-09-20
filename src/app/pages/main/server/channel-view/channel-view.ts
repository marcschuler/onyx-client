import {Component, HostListener, Input} from '@angular/core';
import {ServerObjectId} from '../../../../services/websocket/WebSocketEvents';
import {BrushCleaningIcon, LucideAngularModule} from 'lucide-angular';
import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {PeerConnectionService} from '../../../../services/peer/peer-connection-service';
import {PeerView} from '../../../../components/server/peer-view/peer-view';
import {NgStyle} from '@angular/common';
import {InterfaceService, InterfaceSettings} from '../../../../services/interface-service';
import {FormsModule} from '@angular/forms';
import {MessageView} from '../../../../components/server/message-view/message-view';

@Component({
  selector: 'app-channel-view',
  imports: [
    LucideAngularModule,
    PeerView,
    FormsModule,
    MessageView,
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView {

  @Input() channelId!: ServerObjectId;

  gridRows: number = 1;
  gridCols: number = 1;

  resizing: boolean = false;

  protected readonly BrushCleaningIcon = BrushCleaningIcon;

  constructor(protected webSocketService: WebSocketService,
              protected peerConnectionService: PeerConnectionService,
              protected interfaceService: InterfaceService) {
  }

  /**
   * Resizing
   */
  startResize(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;

    const totalHeight = window.innerHeight;
    const headerHeight = 56;
    const availableHeight = totalHeight - headerHeight;

    // Calculate percentage based on mouse Y position
    const mainPx = event.clientY - headerHeight;
    const mainPercent = (mainPx / availableHeight) * 100;

    // Constrain between 30–70
    const peerView = Math.min(70, Math.max(30, mainPercent));
    const messageView = 100 - peerView;

    this.interfaceService.settings.channelSplitSize.peerView = peerView;
    this.interfaceService.settings.channelSplitSize.messageView = messageView;

    this.interfaceService.saveSettings();
  }

  @HostListener('document:mouseup')
  stopResize() {
    this.resizing = false;
  }

  updateGrid(): void {
    const num = this.peerConnectionService.peers.length;
    //TODO there probably is a clever mathematical way to do this, but I don't care right now
    if (num <= 1) {
      this.gridRows = 1;
      this.gridRows = 1;
    } else if (num <= 2) {
      this.gridRows = 1;
      this.gridCols = 2;
    } else if (num <= 4) {
      this.gridRows = 2;
      this.gridCols = 2;
    } else if (num <= 6) {
      this.gridRows = 3;
      this.gridCols = 2;
    }//TODO
  }
}
