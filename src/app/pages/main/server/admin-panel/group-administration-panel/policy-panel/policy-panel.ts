import {Component, Input} from '@angular/core';
import {GroupDTO} from '../../../../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';

@Component({
  selector: 'app-policy-panel',
  imports: [],
  templateUrl: './policy-panel.html',
  styleUrl: './policy-panel.css',
})
export class PolicyPanel {
  @Input() group!: GroupDTO;
  @Input() connection!: WebSocketServerConnection;

  constructor() {

  }

}
