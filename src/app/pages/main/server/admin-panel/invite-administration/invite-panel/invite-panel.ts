import {Component, inject, Input} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {
  LucideCalendarChevronsRight, LucideCalendarClock,
  LucideChevronDown,
  LucideChevronUp,
  LucideEye,
  LucideTicketSlash,
  LucideX
} from "@lucide/angular";
import {InviteDTO} from '../../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../../../services/rest/rest-service';
import {ToastService, ToastType} from '../../../../../../services/ui/toast-service';
import {removeItemFromList} from '../../../../../../util';
import {DatePipe} from '@angular/common';
import {MultiSelect} from '../../../../../../components/ui/multi-select/multi-select';
import {SelectItem} from '../../../../../../components/ui/multi-select/select-item/select-item';

@Component({
  selector: 'app-invite-panel',
  imports: [
    FormsModule,
    LucideChevronDown,
    LucideChevronUp,
    LucideEye,
    LucideTicketSlash,
    LucideX,
    LucideCalendarChevronsRight,
    DatePipe,
    LucideCalendarClock,
    MultiSelect,
    SelectItem
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
  protected showCode: boolean = false;


  protected save() {
    this.connection.rest.inviteController.edit(
      this.connection.server.info.id,
      this.invite.code,
      this.invite
    ).subscribe(() => {
    }, error => this.restService.handleError(error));
  }

  protected delete() {
    this.connection.rest.inviteController._delete(
      this.connection.server.info.id,
      this.invite.code,
    ).subscribe(() => {
      this.toastService.create({
        title: 'Invite deleted',
        type: ToastType.Success
      })
      removeItemFromList(this.invites, this.invite);
    }, error => this.restService.handleError(error));
  }


  protected readonly Math = Math;
}
