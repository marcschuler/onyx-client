import {Component, Input} from '@angular/core';
import { WebSocketServerConnection } from "../../../../../services/websocket/WebSocketServerConnection";
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';
import {PolicyPanel} from '../group-administration-panel/policy-panel/policy-panel';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PolicyDTO} from '../../../../../../api/webrtc-server';

@Component({
  selector: 'app-policy-administration-panel',
  imports: [
    LucideAngularModule,
    PolicyPanel,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './policy-administration-panel.html',
  styleUrl: './policy-administration-panel.css',
})
export class PolicyAdministrationPanel {
  @Input() connection!: WebSocketServerConnection;

  policies: PolicyDTO[]|undefined;

  selectedPolicy: PolicyDTO|undefined;

  protected addPolicy() {

  }

  protected readonly IdCardLanyard = IdCardLanyard;

  protected updateGroup(selectedGroup: any) {

  }

  protected deleteGroup(selectedGroup: any) {

  }
}
