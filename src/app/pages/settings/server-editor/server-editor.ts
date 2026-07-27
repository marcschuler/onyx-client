import {Component, Input, OnInit, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Popup} from '../../../components/ui/popup/popup';
import {ServerConnection, ServerLoaderService} from '../../../services/server-loader-service';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {LucideAngularModule} from 'lucide-angular';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {BUTTON_CANCEL, BUTTON_DELETE} from '../../../components/ui/dialog/dialog';

@Component({
  selector: 'app-server-editor',
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './server-editor.html',
  styleUrl: './server-editor.css',
})
export class ServerEditor implements OnInit {
  private serverLoaderService = inject(ServerLoaderService);
  private toastService = inject(ToastService);
  private contextMenuService = inject(ContextMenuService);


  @Input() serverConnection!: ServerConnection;

  name!: string | undefined;
  url!: string;

  ngOnInit(): void {
    this.name = this.serverConnection.name;
    this.url = this.serverConnection.url;
  }

  save() {
    if (this.url === "") {
      this.toastService.create({
        type: ToastType.Error,
        message: "You have to provide a valid server URL"
      })
      return;
    }
    this.serverConnection.name = this.name;
    this.serverConnection.url = this.url;

    this.serverLoaderService.saveServer();
  }

  protected openDeletePopup() {
    this.contextMenuService.openDialog({
      title: 'Delete this connection?',
      buttons: [
        BUTTON_CANCEL,
        BUTTON_DELETE.asCallback(() => {
          console.log("Deleting server", this.serverConnection);
          this.serverLoaderService.removeServer(this.serverConnection);
        })
      ],
      content: 'The server does not delete your personal data like profile image or messages.'
    })
  }
}
