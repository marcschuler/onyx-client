import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ButtonPanel, TabPanelEntry} from '../../../../components/ui/button-panel/button-panel';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../services/rest-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {ServerDTO} from '../../../../../api/webrtc-server/model/serverDTO';
import {ToastService, ToastType} from '../../../../services/toast-service';
import {ServerAdministrationPanel} from './server-administration-panel/server-administration-panel';
import {ChannelAdministrationPanel} from './channel-administration-panel/channel-administration-panel';

@Component({
  selector: 'app-admin-panel',
  imports: [ButtonPanel, FormsModule, Spinner, ServerAdministrationPanel, ChannelAdministrationPanel],
  templateUrl: './admin-panel.html',
  standalone: true,
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit, OnChanges {


  protected selectedOption!: TabPanelEntry;
  @Input() connection!: WebSocketServerConnection;


  BUTTON_SERVER_ADMINISTRATION: TabPanelEntry = {
    id: "server-administration",
    name: "Server Administration"
  }
  BUTTON_CHANNEL_TREE: TabPanelEntry = {
    id: "channel-tree",
    name: "Sections & Channel"
  }

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
  }


}
