import { Component, Input, OnInit, inject } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Button, BUTTON_CANCEL, BUTTON_DELETE, BUTTON_EDIT, Popup} from '../../../components/ui/popup/popup';
import {ServerConnection, ServerLoaderService} from '../../../services/server-loader-service';
import {replaceInList} from '../../../util';
import {ToastService, ToastType} from '../../../services/toast-service';
import {LucideAngularModule, ShredderIcon} from 'lucide-angular';

@Component({
  selector: 'app-server-editor',
  imports: [
    FormsModule,
    Popup,
    LucideAngularModule
  ],
  templateUrl: './server-editor.html',
  styleUrl: './server-editor.css',
})
export class ServerEditor implements OnInit {
  private serverLoaderService = inject(ServerLoaderService);
  private toastService = inject(ToastService);


  @Input() serverConnection!: ServerConnection;

  name!: string | undefined;
  url!: string;

  deletePopup = false;

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

  remove(button: Button) {
    if (button == BUTTON_DELETE)
      this.serverLoaderService.removeServer(this.serverConnection);
    this.deletePopup = false;
  }

  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;
}
