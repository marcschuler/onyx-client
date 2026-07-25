import { Component, Input, OnInit, inject } from '@angular/core';
import {SplitPanel} from '../../../../components/ui/split-panel/split-panel';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {ToastService} from '../../../../services/ui/toast-service';
import ServerAdministrationPanel from './server-administration-panel/server-administration-panel';
import {ChannelAdministrationPanel} from './channel-administration-panel/channel-administration-panel';
import {
  HexagonIcon,
  IdCardLanyardIcon,
  ServerCogIcon
} from 'lucide-angular';
import {GroupAdministrationPanel} from './group-administration-panel/group-administration-panel';
import {SplitPanelBar} from '../../../../components/ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../../../components/ui/split-panel/split-panel-button/split-panel-button';
import {SplitPanelSelector} from '../../../../directives/split-panel-selector';
import {GroupDTO} from '../../../../../api/webrtc-server';
import {ChannelEditor} from '../../../../components/channel/channel-editor/channel-editor';
import {SectionEditor} from '../../../../components/section/section-editor/section-editor';
import {Popup} from '../../../../components/ui/popup/popup';

@Component({
  selector: 'app-admin-panel',
  imports: [SplitPanel, FormsModule, ServerAdministrationPanel, ChannelAdministrationPanel, GroupAdministrationPanel, SplitPanelBar, SplitPanelButton, SplitPanelSelector, ChannelEditor, SectionEditor, Popup],
  templateUrl: './admin-panel.html',
  standalone: true,
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {
  private restService = inject(RestService);
  private toastService = inject(ToastService);


  @Input() connection!: WebSocketServerConnection;

  groups: GroupDTO[] | undefined;


  ngOnInit(): void {
    this.connection.rest.groupController.all()
      .subscribe(value => {
        this.groups = value;
      }, error => this.restService.handleError(error));
  }


  protected readonly ServerCogIcon = ServerCogIcon;
  protected readonly HexagonIcon = HexagonIcon;
  protected readonly IdCardLanyardIcon = IdCardLanyardIcon;
}
