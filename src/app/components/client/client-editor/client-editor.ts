import {Component, Input, OnInit} from '@angular/core';
import {ButtonPanel, TabPanelEntry} from "../../ui/button-panel/button-panel";
import {General} from "../../../pages/settings/general/general";
import {CheckIcon, LucideAngularModule, PersonStandingIcon, XIcon} from 'lucide-angular';
import {FileUpload} from '../../ui/file-upload/file-upload';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {ToastService, ToastType} from '../../../services/toast-service';
import {ClientChangeEvent, FileDTO} from '../../../../api/webrtc-server';
import {FormsModule} from '@angular/forms';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {RestService} from '../../../services/rest-service';

@Component({
  selector: 'app-client-editor',
  imports: [
    ButtonPanel,
    FileUpload,
    StorageFileURLPipe,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './client-editor.html',
  styleUrl: './client-editor.css',
})
export class ClientEditor {

  @Input() connection!: WebSocketServerConnection;

  TAB_GENERAL: TabPanelEntry = {
    id: "General",
    name: 'General',
    icon: PersonStandingIcon
  }

  selectedOption!: TabPanelEntry;

  inviteCode: string = "";

  constructor(private toastService: ToastService, private webSocketService: WebSocketService,
              private restService: RestService) {

  }

  protected onAvatarChange($event: FileDTO) {
    this.toastService.create({
      message: "Avatar updated",
      type: ToastType.Success
    })
  }


  protected deleteAvatar() {
    this.connection.rest.userController.avatarDelete(this.connection.me.id)
      .subscribe(_ => {
        this.toastService.create({
          message: "Avatar deleted",
          type: ToastType.Success
        })
      }, error => this.restService.handleError(error))
  }

  protected sendInviteCode() {
    this.connection.rest.userController.invite(this.connection.me.id, this.inviteCode)
      .subscribe(_ => {
        this.toastService.create({
          type: ToastType.Success,
          title: "Invite Code used"
        })
        this.inviteCode = "";
      }, error => this.restService.handleError(error))
  }


  protected readonly XIcon = XIcon;
}
