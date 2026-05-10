import {Component, Input, OnInit} from '@angular/core';
import {PolicyEditor, PolicyType} from '../../server/policy-editor/policy-editor';
import {BUTTON_EDIT} from '../../ui/popup/popup';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';
import {ButtonPanel, TabPanelEntry} from '../../ui/button-panel/button-panel';
import {DiamondMinusIcon, HexagonIcon, LucideAngularModule, SaveIcon} from 'lucide-angular';
import {ToastService, ToastType} from '../../../services/toast-service';

@Component({
  selector: 'app-channel-editor',
  imports: [
    PolicyEditor,
    ButtonPanel,
    LucideAngularModule,
  ],
  templateUrl: './channel-editor.html',
  styleUrl: './channel-editor.css',
})
export class ChannelEditor implements OnInit {

  protected selectedOption!: TabPanelEntry;

  BUTTON_GENERAL: TabPanelEntry = {
    id: "channel-general",
    icon: HexagonIcon,
    name: "General"
  }
  BUTTON_POLICIES: TabPanelEntry = {
    id: "channel-policies",
    icon: DiamondMinusIcon,
    name: "Policies"
  }

  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: string;

  channel: ChannelDTO | undefined;

  constructor(private restService: RestService,
              private toastService: ToastService) {

  }

  ngOnInit(): void {
    this.connection.rest.channelController.channel(this.channelId)
      .subscribe(channel => this.channel = channel, error => this.restService.handleError(error));
  }

  protected readonly PolicyType = PolicyType;
  protected readonly BUTTON_EDIT = BUTTON_EDIT;
  protected readonly SaveIcon = SaveIcon;

  protected save() {
    this.connection.rest.channelController.edit5(this.channelId,this.channel!)
      .subscribe(channel => {
          this.channel = channel;
          this.toastService.create({
            title:"Channel edited",
            type: ToastType.Success
          })
        },
        error=>this.restService.handleError(error));
  }
}
