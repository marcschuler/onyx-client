import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {PeerConnectionService, TrackType} from '../../../../services/peer/peer-connection-service';
import {PeerView} from '../../../../components/server/peer-view/peer-view';
import {InterfaceService} from '../../../../services/interface-service';
import {FormsModule} from '@angular/forms';
import {MessageView} from '../../../../components/server/message-view/message-view';
import {ServerObjectId, WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {ChannelDetailRequest, ChannelDetailResponse} from '../../../../../api/webrtc-server';
import {ChannelDTO} from '../../../../../api/webrtc-server/model/channelDTO';
import {NgClass, NgStyle} from '@angular/common';

@Component({
  selector: 'app-channel-view',
  imports: [
    PeerView,
    FormsModule,
    MessageView,
    NgClass,
    NgStyle,
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView implements AfterViewInit, OnChanges {

  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: ServerObjectId;

  @ViewChild('title') titleContainer!: ElementRef;
  @ViewChild('peerGrid') peerGridContainer!: ElementRef;
  @ViewChild('talkView') talkViewContainer!: ElementRef;


  details: ChannelDTO | undefined;

  gridCols = 2;
  gridRows = 2;
  gridColHeight = 128;
  gridColWidth = 128;

  resizing: boolean = false;

  constructor(protected webSocketService: WebSocketService,
              protected peerConnectionService: PeerConnectionService,
              protected interfaceService: InterfaceService) {
  }

  ngAfterViewInit(): void {
    this.updateDetails();
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
    this.webSocketService.sendWithResponse(this.connection,
      {
        channelId: this.channelId,
        type: ChannelDetailRequest.TypeEnum.ChannelDetailRequest,
      } as ChannelDetailRequest, (event, connection) => {
        const e = event as ChannelDetailResponse;
        this.details = e.channel;
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

    console.log("new height is " + newHeightVh + "vh")


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
    const containerWidth = this.peerGridContainer.nativeElement.clientWidth;
    // const containerHeight = this.peerGridContainer.nativeElement.clientHeight;
    // const containerHeight = this.talkViewContainer.nativeElement.clientHeight - this.titleContainer.nativeElement.clientHeight;
    const talkViewHeight =
      this.talkViewContainer.nativeElement.getBoundingClientRect().height;

    const titleHeight =
      this.titleContainer.nativeElement.getBoundingClientRect().height;
    const containerHeight = talkViewHeight - titleHeight;


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
      colWidth = containerWidth/cols;
      colHeight = colWidth / 16 * 9;
    }

    this.gridCols = cols;
    this.gridRows = rows;
    this.gridColHeight = colHeight;
    this.gridColWidth = colHeight / 9 * 16;
    console.log("using " + cols + "x" + rows + " for height " + colHeight + "/" + containerHeight)

  }
}
