import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  signal
} from '@angular/core';

import {
  MessageHandler,
  WebSocketService
} from '../../../../services/websocket/web-socket-service';
import {PeerConnectionService} from '../../../../services/peer/peer-connection-service';
import {PeerView} from '../../../../components/server/peer-view/peer-view';
import {StorageService} from '../../../../services/storage.service';
import {FormsModule} from '@angular/forms';
import {MessageView} from '../../../../components/server/message-view/message-view';
import {ServerObjectId, WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../../api/onyx-server/model/channelDTO';
import {NgStyle} from '@angular/common';
import {TrackType} from '../../../../services/peer/MediaTracker';
import {MediaService} from '../../../../services/peer/media-service';
import {LucideHexagon} from '@lucide/angular';
import {ChannelChangeEvent, TrackMetadataMessage} from '../../../../../api/onyx-server';
import {bestGridLayout, MIN_TILE_WIDTH} from '../../../../services/Util';
import {PeerConnection} from '../../../../services/peer/PeerConnection';

/**
 * A single stream shown in the talk view
 */
interface Tile {
  stream: MediaStream;
  type: TrackMetadataMessage.LabelEnum;
  peer?: PeerConnection; // undefined for our own streams
  hasVideo: boolean;
}

@Component({
  selector: 'app-channel-view',
  imports: [
    PeerView,
    FormsModule,
    MessageView,
    NgStyle,
    LucideHexagon,
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView implements AfterViewInit, OnChanges, OnDestroy {
  protected webSocketService = inject(WebSocketService);
  protected peerConnectionService = inject(PeerConnectionService);
  protected mediaService = inject(MediaService);
  protected interfaceService = inject(StorageService);


  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: ServerObjectId;
  @Input() titleOffsetLeft!: boolean;

  @ViewChild('talkView') talkViewContainer!: ElementRef;

  // the grid is inside an @if, so (re)observe it whenever it appears
  @ViewChild('peerGrid') set peerGridContainer(element: ElementRef<HTMLElement> | undefined) {
    this.resizeObserver.disconnect();
    if (element)
      this.resizeObserver.observe(element.nativeElement);
  }

  channel!: ChannelDTO;

  resizing = false;

  // size of the grid container. A signal, so the view updates although ResizeObserver runs outside of zone.js
  private gridSize = signal({width: 0, height: 0});
  private resizeObserver = new ResizeObserver(([entry]) =>
    this.gridSize.set({width: entry.contentRect.width, height: entry.contentRect.height}));

  ngAfterViewInit(): void {
    this.webSocketService.addHandler(ChannelChangeEvent.TypeEnum.ChannelChangeEvent, this.onChannelChange);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.channel = this.connection.channel(this.channelId)!;
  }

  onChannelChange: MessageHandler<ChannelChangeEvent> = (event) => {
    if (event.channel.id == this.channelId) {
      console.log("channel-view: active channel did change")
      this.channel = event.channel;
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
    this.webSocketService.removeHandler(this.onChannelChange);
  }

  /**
   * All streams to show: our own first, then the ones of our peers
   */
  protected get tiles(): Tile[] {
    const tiles: Tile[] = [];
    const add = (stream: MediaStream | undefined, type: TrackMetadataMessage.LabelEnum, peer?: PeerConnection) => {
      if (stream && stream.getTracks().length > 0)
        tiles.push({stream, type, peer, hasVideo: stream.getVideoTracks().length > 0});
    };
    const local = this.mediaService.localStream;
    add(local.cameraMic, 'CAMERAMIC');
    add(local.screen, 'SCREEN');
    for (const peer of this.peerConnectionService.peers) {
      add(peer.streams.screen, 'SCREEN', peer);
      add(peer.streams.cameraMic, 'CAMERAMIC', peer);
    }
    return tiles;
  }

  /**
   * Without any video stream, every tile is shown in the grid (audioTiles is empty).
   * With video, audio-only tiles get a small row on top and only video tiles are in the grid.
   */
  protected get talkTiles(): { audioTiles: Tile[], gridTiles: Tile[] } {
    const tiles = this.tiles;
    const videoTiles = tiles.filter(t => t.hasVideo);
    if (videoTiles.length === 0)
      return {audioTiles: [], gridTiles: tiles};
    return {audioTiles: tiles.filter(t => !t.hasVideo), gridTiles: videoTiles};
  }

  protected layout(count: number) {
    const {width, height} = this.gridSize();
    return bestGridLayout(count, width, height, 16 / 9, 8, MIN_TILE_WIDTH);
  }

  /**
   * Resizing
   */
  startResizing($event: MouseEvent) {
    this.resizing = true;
    $event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) return;

    const containerTop = this.talkViewContainer.nativeElement.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;

    // Mouse position relative to the container top
    let newHeightVh = ((event.clientY - containerTop) / viewportHeight) * 100;

    // Clamp between min and max vh
    if (newHeightVh < 10) newHeightVh = 10;
    if (newHeightVh > 90) newHeightVh = 90;

    this.interfaceService.interface.state.channelSplitSize.peerView = newHeightVh;
  }

  @HostListener('document:mouseup')
  stopResizing() {
    if (this.resizing) {
      this.resizing = false;
      this.interfaceService.interface.save();
    }
  }

  protected readonly TrackType = TrackType;
}
