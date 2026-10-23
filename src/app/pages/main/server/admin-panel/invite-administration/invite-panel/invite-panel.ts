import {Component, inject, Input} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ChevronDownIcon, ChevronUpIcon, EyeIcon, LucideAngularModule, TicketSlashIcon, XIcon} from "lucide-angular";
import {InviteDTO} from '../../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../../../services/rest/rest-service';
import {ToastService, ToastType} from '../../../../../../services/ui/toast-service';
import {removeItemFromList} from '../../../../../../util';

@Component({
  selector: 'app-invite-panel',
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './invite-panel.html',
  styleUrl: './invite-panel.css',
})
export class InvitePanel {

  private restService = inject(RestService);
  private toastService = inject(ToastService);

  @Input() invite!: InviteDTO;
  @Input() invites!: InviteDTO[];

  @Input() connection!: WebSocketServerConnection;

  protected open: boolean = false;


  protected save() {
    this.connection.rest.inviteController.edit(
      this.connection.data!.server.id,
      this.invite.code,
      this.invite
    ).subscribe(() => {
    }, error => this.restService.handleError(error));
  }

  protected delete() {
    this.connection.rest.inviteController._delete(
      this.connection.data!.server.id,
      this.invite.code,
    ).subscribe(() => {
      this.toastService.create({
        title: 'Invite deleted',
        type: ToastType.Success
      })
      removeItemFromList(this.invites, this.invite);
    }, error => this.restService.handleError(error));
  }


  protected readonly TicketSlashIcon = TicketSlashIcon;
  protected readonly XIcon = XIcon;
  protected readonly EyeIcon = EyeIcon;
  protected readonly Math = Math;
  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly ChevronUpIcon = ChevronUpIcon;
}
