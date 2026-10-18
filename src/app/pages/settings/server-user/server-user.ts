import {Component, Input, inject} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ImageOffIcon, LucideAngularModule, XIcon} from "lucide-angular";
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {RestService} from '../../../services/rest/rest-service';
import {FileDTO} from '../../../../api/onyx-server';
import {PreviewImage} from '../../../components/ui/preview-image/preview-image';
import {FileUploadService, UploadState, UploadType} from '../../../services/rest/file-upload-service';

@Component({
  selector: 'app-server-user',
  imports: [
    FormsModule,
    LucideAngularModule,
    PreviewImage
  ],
  templateUrl: './server-user.html',
  styleUrl: './server-user.css',
})
export class ServerUser {
  private toastService = inject(ToastService);
  protected fileUploadService = inject(FileUploadService);
  private restService = inject(RestService);


  @Input() connection!: WebSocketServerConnection;

  inviteCode = "";
  avatarUpload: UploadState | undefined;

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
  protected readonly ImageOffIcon = ImageOffIcon;

  protected async uploadAvatar($event?: any) {
    if (this.avatarUpload)
      return;
    this.fileUploadService.fileFromDropOrDialog($event).then(
      file => {
        if (!file)
          return;
        this.fileUploadService.uploadFile(this.connection, file, UploadType.USER_AVATAR).subscribe(state => {
          if (state.done) {
            this.avatarUpload = undefined;
          } else {
            this.avatarUpload = state;
          }
        }, error => this.restService.handleError(error))
      }
    )
  }

  protected deleteIcon() {
    this.connection.rest.userController.avatarDelete(this.connection.me.id);
  }
}
