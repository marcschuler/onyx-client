import {AfterContentInit, Component, Input} from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {PermissionListHeader, PolicyService} from '../../../services/policy-service';
import {PolicyDTO} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';

@Component({
  selector: 'app-policy-editor',
  imports: [],
  templateUrl: './policy-editor.html',
  styleUrl: './policy-editor.css',
})
export class PolicyEditor implements AfterContentInit {

  @Input() connection!: WebSocketServerConnection;
  @Input() type!: PolicyType;

  policies: PolicyDTO[]|undefined;

  permissionList!: PermissionListHeader[];

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

}

export enum PolicyType {
  SERVER,
  SECTION,
  CHANNEL
}
