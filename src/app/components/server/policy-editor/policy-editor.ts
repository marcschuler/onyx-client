import {AfterContentInit, Component, Input} from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {PermissionListHeader, PermissionListItem, PolicyService} from '../../../services/policy-service';
import {PolicyDTO, PolicyItem} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';
import {DTOWithPolicies} from '../../../types';
import {Popup} from '../../ui/popup/popup';

@Component({
  selector: 'app-policy-editor',
  imports: [
    Popup
  ],
  templateUrl: './policy-editor.html',
  styleUrl: './policy-editor.css',
})
export class PolicyEditor implements AfterContentInit {

  @Input() connection!: WebSocketServerConnection;
  @Input() type!: PolicyType;
  @Input() data!: DTOWithPolicies;

  policies: PolicyDTO[] | undefined;

  permissionList!: PermissionListHeader[];

  policyToAdd: PermissionListItem | undefined;

  constructor(private policyService: PolicyService, private restService: RestService) {
    this.initPolicy();
  }


  initPolicy() {
    this.permissionList = this.policyService.buildPermissionList();
  }

  ngAfterContentInit(): void {
    this.connection.rest
      .policyController.policies()
      .subscribe(value => {
        this.policies = value;
      }, error => this.restService.handleError(error));
  }

  protected addPolicyToPolicyItem(policyToAdd: PermissionListItem, policy: PolicyDTO) {
    const policyItem = (this.data.policies[policyToAdd.type] as PolicyItem)
    policyItem.policies?.push(policy);
  }
}

export enum PolicyType {
  SERVER,
  SECTION,
  CHANNEL
}
