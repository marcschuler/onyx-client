import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SplitPanel, TabPanelEntry} from '../../../../components/ui/split-panel/split-panel';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {ServerDTO} from '../../../../../api/webrtc-server/model/serverDTO';
import {ToastService, ToastType} from '../../../../services/toast-service';
import ServerAdministrationPanel from './server-administration-panel/server-administration-panel';
import {ChannelAdministrationPanel} from './channel-administration-panel/channel-administration-panel';
import {
  DiamondMinusIcon,
  HexagonIcon,
  IdCardLanyard,
  IdCardLanyardIcon,
  ServerCog,
  ServerCogIcon
} from 'lucide-angular';
import {GroupAdministrationPanel} from './group-administration-panel/group-administration-panel';
import {SplitPanelBar} from '../../../../components/ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../../../components/ui/split-panel/split-panel-button/split-panel-button';
import {SplitPanelSelector} from '../../../../directives/split-panel-selector';

@Component({
  selector: 'app-admin-panel',
  imports: [SplitPanel, FormsModule, ServerAdministrationPanel, ChannelAdministrationPanel, GroupAdministrationPanel, SplitPanelBar, SplitPanelButton, SplitPanelSelector],
  templateUrl: './admin-panel.html',
  standalone: true,
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit, OnChanges {

  @Input() connection!: WebSocketServerConnection;

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
  }


  protected readonly ServerCogIcon = ServerCogIcon;
  protected readonly HexagonIcon = HexagonIcon;
  protected readonly IdCardLanyardIcon = IdCardLanyardIcon;
}
