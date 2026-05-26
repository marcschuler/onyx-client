import {Component, Input} from '@angular/core';
import {FileUpload, UploadType} from "../../../components/ui/file-upload/file-upload";
import {FormsModule} from "@angular/forms";
import {LucideAngularModule, XIcon} from "lucide-angular";
import {StorageFileURLPipe} from "../../../pipes/avatar-pipe";
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ToastService, ToastType} from '../../../services/toast-service';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {RestService} from '../../../services/rest-service';
import {FileDTO} from '../../../../api/webrtc-server';
import {PreviewImage} from '../../../components/ui/preview-image/preview-image';

@Component({
  selector: 'app-server-user',
  imports: [
    FileUpload,
    FormsModule,
    LucideAngularModule,
    StorageFileURLPipe,
    PreviewImage
  ],
  templateUrl: './server-user.html',
  styleUrl: './server-user.css',
})
export class ServerUser {

  @Input() connection!: WebSocketServerConnection;

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
  protected readonly UploadType = UploadType;
}
