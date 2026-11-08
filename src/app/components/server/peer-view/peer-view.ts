import {Component, ElementRef, HostListener, inject, Input} from '@angular/core';
import {PeerConnection, PeerConnectionState} from '../../../services/peer/PeerConnection';
import {
  LucideCircleX,
  LucideLoader,
  LucideMaximize,
  LucideMinimize,
  LucidePowerOff,
  LucideVolume2,
  LucideVolumeX
} from '@lucide/angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {TrackMetadataMessage} from '../../../../api/onyx-server';
import {DebugService} from '../../../services/debug-service';
import {ProfileImage} from '../../client/profile-image/profile-image';
import {UserSimpleDTO} from '../../../../api/onyx-server';

@Component({
  selector: 'app-peer-view',
  imports: [
    LucideCircleX,
    LucideLoader,
    LucidePowerOff,
    LucideVolume2,
    LucideVolumeX,
    LucideMaximize,
    LucideMinimize,
    ProfileImage,
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
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly PeerConnectionState = PeerConnectionState;

  protected volume = 1; // 0 - 1
  protected muted = false;
  protected fullscreen = false;

  protected openClientContextMenu($event: PointerEvent) {
    this.contextMenuService.openClientContextMenu(this.peer ? this.peer.client.details : this.connection.me.details, this.connection, $event)
  }

  protected hasVideo(): boolean {
    return this.stream.getVideoTracks().length > 0;
  }

  /** the user this stream belongs to - the peer, or ourselves for our own streams */
  protected get user(): UserSimpleDTO {
    return this.peer ? this.peer.client.details : this.connection.me.details;
  }

  protected hasAudio(): boolean {
    return this.stream.getAudioTracks().length > 0;
  }

  protected setVolume(volume: number) {
    this.volume = volume;
    this.muted = false;
  }

  protected toggleMute() {
    if (this.volume === 0) { // "unmuting" a slider at 0 should be audible
      this.volume = 1;
      this.muted = false;
      return;
    }
    this.muted = !this.muted;
  }

  protected toggleFullscreen(element: HTMLElement) {
    if (this.fullscreen) {
      document.exitFullscreen().catch(e => console.error("could not exit fullscreen", e));
    } else {
      element.requestFullscreen().catch(e => console.error("could not enter fullscreen", e));
    }
  }

  @HostListener('document:fullscreenchange')
  protected onFullscreenChange() {
    // only this view - other peer views get the event too
    const element = document.fullscreenElement;
    this.fullscreen = element != null && this.host.nativeElement.contains(element);
  }
}
