import {Component, Input, OnInit} from '@angular/core';
import {PolicyEditor, PolicyType} from '../../server/policy-editor/policy-editor';
import {Popup} from '../../ui/popup/popup';
import {KeyId, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';
import {ButtonPanel, TabPanelEntry} from '../../ui/button-panel/button-panel';
import {
  ChannelAdministrationPanel
} from '../../../pages/main/server/admin-panel/channel-administration-panel/channel-administration-panel';
import {
  GroupAdministrationPanel
} from '../../../pages/main/server/admin-panel/group-administration-panel/group-administration-panel';
import {
  ServerAdministrationPanel
} from '../../../pages/main/server/admin-panel/server-administration-panel/server-administration-panel';
import {DiamondMinusIcon, HexagonIcon, IdCardLanyard, ServerCog} from 'lucide-angular';

@Component({
  selector: 'app-channel-editor',
  imports: [
    PolicyEditor,
    ButtonPanel,
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

  constructor(private restService: RestService) {

  }

  ngOnInit(): void {
    this.connection.rest.channelController.channel(this.channelId)
      .subscribe(channel => this.channel = channel, error => this.restService.handleError(error));
  }

  protected readonly PolicyType = PolicyType;
}
