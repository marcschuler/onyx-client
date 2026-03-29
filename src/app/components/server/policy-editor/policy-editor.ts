import {AfterContentInit, Component, Input} from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {
  PermissionListHeader,
  PermissionListItem,
  PermissionType,
  PolicyService
} from '../../../services/policy-service';
import {PolicyDTO, PolicyItem} from '../../../../api/webrtc-server';
import {RestService} from '../../../services/rest-service';
import {DTOWithPolicies} from '../../../types';
import {Popup} from '../../ui/popup/popup';
import {ChevronDown, ChevronUp, CircleX, DiamondPlus, LucideAngularModule} from 'lucide-angular';
import {moveDownInList, moveUpInList} from '../../../util';

@Component({
  selector: 'app-policy-editor',
  imports: [
    Popup,
    LucideAngularModule
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

  permissionTypeToAdd: PermissionType|undefined;

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

  protected addPolicyToPolicyItem(type: PermissionType, policy: PolicyDTO) {
    var policyItem = this.data.policies[type] as PolicyItem|undefined;
    if (policyItem==undefined){ // create if not yet exists
      policyItem = {
        policies:[]
      }
      this.data.policies[type] = policyItem;
    }
    if (policyItem.policies!.indexOf(policy)!=-1){
      console.warn("Policy already exists in PolicyItem");
    }else{
    policyItem.policies!.push(policy);
    }
    this.permissionTypeToAdd= undefined;
  }

  protected readonly CircleX = CircleX;
  protected readonly ChevronUp = ChevronUp;
  protected readonly ChevronDown = ChevronDown;
  protected readonly DiamondPlus = DiamondPlus;
  protected readonly moveDownInList = moveDownInList;
  protected readonly moveUpInList = moveUpInList;
}

export enum PolicyType {
  SERVER,
  SECTION,
  CHANNEL
}
