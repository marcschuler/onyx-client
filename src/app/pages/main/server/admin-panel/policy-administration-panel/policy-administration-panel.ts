import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';
import {PolicyPanel} from '../group-administration-panel/policy-panel/policy-panel';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GroupDTO, PolicyDTO, RolePolicyDTO, UserSimpleDTO} from '../../../../../../api/webrtc-server';
import {RestService} from '../../../../../services/rest-service';
import {removeItemFromList} from '../../../../../util';
import {PolicyType} from '../../../../../types';
import {MultiSelect} from '../../../../../components/ui/multi-select/multi-select';
import {Option} from '@angular/aria/listbox';
import {Tabs} from '../../../../../components/ui/tabs/tabs';
import {TabItem} from '../../../../../components/ui/tabs/tab-item';

@Component({
  selector: 'app-policy-administration-panel',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelect,
    Option,
    Tabs,
    TabItem
  ],
  templateUrl: './policy-administration-panel.html',
  styleUrl: './policy-administration-panel.css',
})
export class PolicyAdministrationPanel implements OnInit {
  @Input() connection!: WebSocketServerConnection;

  policies: PolicyDTO[] | undefined;

  selectedPolicy: PolicyDTO | undefined;

  groups: GroupDTO[] | undefined;
  users: UserSimpleDTO[] | undefined;

  get selectedPolicyAsRole(): RolePolicyDTO{
    return this.selectedPolicy as RolePolicyDTO;
  }

  constructor(private restService: RestService) {
  }

  ngOnInit(): void {
    this.connection.rest.policyController.policies()
      .subscribe(value => this.policies = value,
        error => this.restService.handleError(error))

    this.connection.rest.userController.users()
      .subscribe(users => this.users = users,
        error=>this.restService.handleError(error));

    this.connection.rest.groupController.all()
      .subscribe(groups => this.groups = groups,
        error => this.restService.handleError(error));
  }

  protected addPolicy() {
    this.connection.rest.policyController.create1({
      name: "Policy",
      description: undefined,
    }).subscribe(value => {
      this.policies?.push(value);
    }, error => this.restService.handleError(error))

  }

  protected readonly IdCardLanyard = IdCardLanyard;

  protected updatePolicy(policy: PolicyDTO) {
    this.connection.rest.policyController
      .edit2(policy.id, policy)
      .subscribe(value => {
      }, error => this.restService.handleError(error))
  }

  protected deletePolicy(policy: PolicyDTO) {
    this.connection.rest.policyController
      .delete1(policy.id)
      .subscribe(() => {
        removeItemFromList(this.policies!, policy);
      }, error => this.restService.handleError(error))
  }

  protected readonly PolicyType = PolicyType;
}
