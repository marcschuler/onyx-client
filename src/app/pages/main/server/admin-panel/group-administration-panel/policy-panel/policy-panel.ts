import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {GroupDTO} from '../../../../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';
import {FormsModule} from '@angular/forms';
import {PermissionListHeader, PolicyService} from '../../../../../../services/policy-service';

@Component({
  selector: 'app-policy-panel',
  imports: [
    FormsModule
  ],
  templateUrl: './policy-panel.html',
  styleUrl: './policy-panel.css',
})
export class PolicyPanel implements OnChanges{
  @Input() group!: GroupDTO;
  @Input() groups!: GroupDTO[];
  @Input() connection!: WebSocketServerConnection;

  permissionList: PermissionListHeader[];

  constructor(private policyService: PolicyService) {
    this.permissionList = policyService.buildPermissionList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    }
}




