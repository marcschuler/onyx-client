import {Component, ErrorHandler, inject, Input, OnInit} from '@angular/core';
import {InviteControllerService, InviteDTO, InviteResponseDto} from '../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {Spinner} from '../../../../../components/ui/spinner/spinner';
import {EyeIcon, LucideAngularModule, TicketSlashIcon, XIcon} from 'lucide-angular';
import {FormsModule} from '@angular/forms';
import {InvitePanel} from './invite-panel/invite-panel';
import {RestService} from '../../../../../services/rest/rest-service';

@Component({
  selector: 'app-invite-administration',
  imports: [
    Spinner,
    LucideAngularModule,
    FormsModule,
    InvitePanel
  ],
  templateUrl: './invite-administration.html',
  styleUrl: './invite-administration.css',
})
export class InviteAdministration implements OnInit {

  inviteControllerService = inject(InviteControllerService);
  restService = inject(RestService)

  @Input() connection!: WebSocketServerConnection;

  invites: InviteDTO[] | undefined;

  code = "";
  title = "";


  ngOnInit(): void {
    this.inviteControllerService.all(this.connection.data!.server.id).subscribe(invites => {
      this.invites = invites;
    }, error => this.restService.handleError(error));
  }


  protected create() {
    this.connection.rest.inviteController.create(this.connection.data!.server.id, {
      code: this.code,
      title: this.title,
      usages: 0
    }).subscribe((invite) => {
      this.code = "";
      this.title = "";
      this.invites!.push(invite);
    }, error => this.restService.handleError(error));
  }

  protected readonly XIcon = XIcon;
}
