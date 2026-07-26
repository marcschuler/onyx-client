import {Component, inject, Input} from '@angular/core';
import {RestService} from '../../../services/rest-service';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ChannelDTO, SectionDTO} from '../../../../api/onyx-server';
import {LucideAngularModule, SaveIcon} from 'lucide-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-section-editor',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './section-editor.html',
  styleUrl: './section-editor.css',
})
export class SectionEditor {
  private restService = inject(RestService);
  private toastService = inject(ToastService);


  @Input() connection!: WebSocketServerConnection;
  @Input() sectionId!: string;

  section: SectionDTO | undefined;

  ngOnInit(): void {
    this.connection.rest.sectionController.section(this.sectionId)
      .subscribe(channel => this.section = channel, error => this.restService.handleError(error));
  }

  protected save() {
    this.connection.rest.sectionController.edit1(this.sectionId, this.section!)
      .subscribe(channel => {
          this.section = channel;
          this.toastService.create({
            title: "Channel edited",
            type: ToastType.Success
          })
        },
        error => this.restService.handleError(error));
  }

  protected delete() {
    this.connection.rest.sectionController._delete(this.sectionId)
      .subscribe(() => {
        this.toastService.create({
          title: "Section deleted",
          type: ToastType.Success
        })
      }, error => this.restService.handleError(error));
  }

  protected readonly SaveIcon = SaveIcon;


}
