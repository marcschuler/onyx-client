import { Component, Input, OnInit, inject } from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';
import {SplitPanel,} from '../../ui/split-panel/split-panel';
import {HexagonIcon, LucideAngularModule, SaveIcon} from 'lucide-angular';
import {ToastService, ToastType} from '../../../services/toast-service';
import {SplitPanelBar} from '../../ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../ui/split-panel/split-panel-button/split-panel-button';

@Component({
  selector: 'app-channel-editor',
  imports: [
    SplitPanel,
    LucideAngularModule,
    SplitPanelBar,
    SplitPanelButton,
  ],
  templateUrl: './channel-editor.html',
  styleUrl: './channel-editor.css',
})
export class ChannelEditor implements OnInit {
  private restService = inject(RestService);
  private toastService = inject(ToastService);


  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: string;

  channel: ChannelDTO | undefined;

  ngOnInit(): void {
    this.connection.rest.channelController.channel(this.channelId)
      .subscribe(channel => this.channel = channel, error => this.restService.handleError(error));
  }

  protected readonly SaveIcon = SaveIcon;

  protected save() {
    this.connection.rest.channelController.edit4(this.channelId, this.channel!)
      .subscribe(channel => {
          this.channel = channel;
          this.toastService.create({
            title: "Channel edited",
            type: ToastType.Success
          })
        },
        error => this.restService.handleError(error));
  }

  protected readonly HexagonIcon = HexagonIcon;
}
