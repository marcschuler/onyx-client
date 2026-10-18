import {Component, ErrorHandler, inject, Input, OnInit} from '@angular/core';
import {InviteControllerService, InviteDTO, InviteResponseDto} from '../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {Spinner} from '../../../../../components/ui/spinner/spinner';
import {EyeIcon, LucideAngularModule, TicketSlashIcon, XIcon} from 'lucide-angular';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-invite-administration',
  imports: [
    Spinner,
    LucideAngularModule,
    FormsModule
  ],
  templateUrl: './invite-administration.html',
  styleUrl: './invite-administration.css',
})
export class InviteAdministration implements OnInit {

  inviteControllerService = inject(InviteControllerService);
  errorHandler = inject(ErrorHandler)

  invites: InviteDTO[] | undefined;

  @Input() connection!: WebSocketServerConnection;

  ngOnInit(): void {
    this.inviteControllerService.all(this.connection.data!.server.id).subscribe(invites => {
      this.invites = invites;
    }, error => this.errorHandler.handleError(error));
  }

  protected readonly TicketSlashIcon = TicketSlashIcon;
  protected readonly EyeIcon = EyeIcon;
  protected readonly Math = Math;
  protected readonly XIcon = XIcon;
}
