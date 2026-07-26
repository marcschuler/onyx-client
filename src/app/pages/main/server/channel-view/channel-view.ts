import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';

import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {PeerConnectionService} from '../../../../services/peer/peer-connection-service';
import {PeerView} from '../../../../components/server/peer-view/peer-view';
import {StorageService} from '../../../../services/storage.service';
import {FormsModule} from '@angular/forms';
import {MessageView} from '../../../../components/server/message-view/message-view';
import {ServerObjectId, WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../../api/onyx-server/model/channelDTO';
import {JsonPipe, NgStyle} from '@angular/common';
import {TrackType} from '../../../../services/peer/MediaTracker';
import {MediaService} from '../../../../services/peer/media-service';

@Component({
  selector: 'app-channel-view',
  imports: [
    PeerView,
    FormsModule,
    MessageView,
    NgStyle,
    JsonPipe,
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView implements AfterViewInit, OnChanges {
  protected webSocketService = inject(WebSocketService);
  protected peerConnectionService = inject(PeerConnectionService);
  protected mediaService = inject(MediaService);
  protected interfaceService = inject(StorageService);


  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: ServerObjectId;
  @Input() titleOffsetLeft!: boolean;

  @ViewChild('title') titleContainer!: ElementRef;
  @ViewChild('peerGrid') peerGridContainer!: ElementRef;
  @ViewChild('talkView') talkViewContainer!: ElementRef;


  details: ChannelDTO | undefined;

  titleHeight = 0; //in px
  gridCols = 2;
  gridRows = 2;
  gridColHeight = 128;
  gridColWidth = 128;

  resizing = false;

  ngAfterViewInit(): void {
    this.updateDetails();
    setInterval(() => {
      this.updateGridSize();
    }, 50)
    setInterval(() => {
      this.updateGridSize(); //TODO this is bad
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['channelId']) {
      this.details = undefined;
      this.updateDetails();
    }
  }

  updateDetails() {
    this.connection.rest.channelController.channel(this.channelId)
      .subscribe(channel => {
        this.details = channel;
      })
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

    //console.log("new height is " + newHeightVh + "vh")


    this.interfaceService.settings.channelSplitSize.peerView = newHeightVh;
    this.updateGridSize();
  }

  @HostListener('document:mouseup')
  stopResizing() {
    if (this.resizing) {
      this.resizing = false;
      this.interfaceService.saveSettings();
    }
  }


  @HostListener('window:resize')
  onResize() {
    this.updateGridSize();
  }


  updateGridSize() {
    const titleHeight =
      this.titleContainer.nativeElement.getBoundingClientRect().height;
    this.titleHeight = titleHeight;

    if (!this.peerGridContainer)
      return;
    const containerWidth = this.peerGridContainer.nativeElement.clientWidth;
    const talkViewHeight =
      this.talkViewContainer.nativeElement.getBoundingClientRect().height;

    const containerHeight = talkViewHeight;


    const ratio = containerWidth / containerHeight;
    const peers = this.peerConnectionService.peers.length + 1;

    let cols = 0;
    let rows = 0;

    //feel like i'm bruteforcing something very simple
    while (true) {
      if (cols == rows) {
        cols++
      } else {
        rows++;
      }
      if (cols * rows >= peers)
        break;
    }

    let colHeight = containerHeight / rows;
    let colWidth = colHeight / 9 * 16;

    if (colWidth * cols > containerWidth) {
      colWidth = containerWidth / cols;
      colHeight = colWidth / 16 * 9;
    }

    this.gridCols = cols;
    this.gridRows = rows;
    this.gridColHeight = colHeight;
    this.gridColWidth = colHeight / 9 * 16;
    //console.log("using " + cols + "x" + rows + " for height " + colHeight + "/" + containerHeight)
  }

  protected readonly TrackType = TrackType;
}
