import {Component, Input, OnInit, inject} from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO} from '../../../../api/onyx-server';
import {RestService} from '../../../services/rest/rest-service';
import { LucideAngularModule, SaveIcon} from 'lucide-angular';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../ui/spinner/spinner';
import {MultiSelect} from '../../ui/multi-select/multi-select';
import {SelectItem} from '../../ui/multi-select/select-item/select-item';

@Component({
  selector: 'app-channel-editor',
  imports: [
    LucideAngularModule,
    FormsModule,
    Spinner,
    MultiSelect,
    SelectItem,
  ],
  templateUrl: './channel-editor.html',
  styleUrl: './channel-editor.css',
})
export class ChannelEditor implements OnInit {
  private restService = inject(RestService);
  private toastService = inject(ToastService);


  @Input() connection!: WebSocketServerConnection;
  @Input() channelId!: string;

  channel: ChannelDTO | undefined;

  ngOnInit(): void {
    this.connection.rest.channelController.channel(this.channelId)
      .subscribe(channel => this.channel = channel, error => this.restService.handleError(error));
  }

  protected readonly SaveIcon = SaveIcon;

  protected save() {
    this.connection.rest.channelController.edit(this.channelId, this.channel!)
      .subscribe(channel => {
          this.channel = channel;
          this.toastService.create({
            title: "Channel edited",
            type: ToastType.Success
          })
        },
        error => this.restService.handleError(error));
  }

  protected delete() {
    this.connection.rest.channelController._delete(this.channelId)
      .subscribe(() => {
        this.toastService.create({
          title: "Channel deleted",
          type: ToastType.Success
        })
      }, error => this.restService.handleError(error));
  }


}
