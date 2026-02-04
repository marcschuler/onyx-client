import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {UserExtendedDTO, UserSimpleDTO} from '../../../../../api/webrtc-server';
import {RestService} from '../../../../services/rest-service';
import {ButtonPanel, TabPanelEntry} from '../../../../components/ui/button-panel/button-panel';
import {AsyncPipe, DatePipe, JsonPipe} from '@angular/common';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {LucideAngularModule, UserCheck, UserMinus, UserPlus} from 'lucide-angular';

@Component({
  selector: 'app-users-panel',
  imports: [
    ButtonPanel,
    AsyncPipe,
    IdenticonPipe,
    DatePipe,
    LucideAngularModule
  ],
  templateUrl: './users-panel.html',
  styleUrl: './users-panel.css',
})
export class UsersPanel implements OnInit {
  BUTTON_USER_LIST: TabPanelEntry = {
    id: "USER_LIST",
    name: "User List"
  }

  @Input() connection!: WebSocketServerConnection;

  users: UserExtendedDTO[] | undefined;
  selectedOption!: TabPanelEntry;

  constructor(private restService: RestService) {
  }

  ngOnInit(): void {
    this.connection.rest.userController.users()
      .subscribe(users => {
        this.users = users;
      }, error => this.restService.handleError(error));
  }

  protected readonly UserExtendedDTO = UserExtendedDTO;
  protected readonly UserCheck = UserCheck;
  protected readonly UserMinus = UserMinus;
  protected readonly UserPlus = UserPlus;
}
