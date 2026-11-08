import {Component, Input, OnChanges, OnInit, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Spinner} from "../../../../../components/ui/spinner/spinner";
import {RestService} from '../../../../../services/rest/rest-service';
import {ToastService, ToastType} from '../../../../../services/ui/toast-service';
import {
  FileDTO,
  MarkdownMessageContentDTO,
  MessageContentDTO,
  ServerDTO
} from '../../../../../../api/onyx-server';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {asTypeMarkdown} from '../../../../../components/chat/message-content/message-content';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideGripVertical,
  LucideImageOff,
  LucideTextInitial,
  LucideTrash,
  LucideX
} from '@lucide/angular';
import {deleteInList, reorderListItem} from '../../../../../services/Util';
import {PreviewImage} from '../../../../../components/ui/preview-image/preview-image';
import {FileUploadService, UploadState, UploadType} from '../../../../../services/rest/file-upload-service';

@Component({
  selector: 'app-server-administration-panel',
  imports: [
    ReactiveFormsModule,
    Spinner,
    FormsModule,
    CdkDragHandle,
    LucideGripVertical,
    LucideImageOff,
    LucideTextInitial,
    LucideX,
    CdkDrag,
    CdkDropList,
    PreviewImage,
    LucideTrash,
    LucideChevronUp,
    LucideChevronDown
  ],
  templateUrl: './server-administration-panel.html',
  styleUrl: './server-administration-panel.css'
})
class ServerAdministrationPanel implements OnChanges, OnInit {
  private restService = inject(RestService);
  private toastService = inject(ToastService);
  private fileUploadService = inject(FileUploadService);


  @Input() connection!: WebSocketServerConnection;

  //TODO remove and access via connection.server.info? Is this here an advantage?
  server: ServerDTO | undefined;

  serverIconUpload: UploadState | undefined;


  ngOnChanges() {
    this.update();
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    this.connection.rest.serverController.get(this.connection.server.info.id)
      .subscribe(server => {
        this.server = server;
        console.log("got server " + JSON.stringify(server))
      }, error => {
        this.restService.handleError(error);
      })
  }

  saveServerInfo() {
    if (!this.server) {
      console.warn("No server dto available - this should not happen");
      return;
    }
    this.connection.rest.serverController.edit(this.server.id, {
      name: this.server.name,
      description: this.server.description
    } as ServerDTO).subscribe(server => {
      this.server = server;
      this.toastService.create({
        title: "Server updated",
        message: "",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error));
  }

  protected async uploadServerIcon($event?: any) {
    if (this.serverIconUpload)
      return;
    this.fileUploadService.fileFromDropOrDialog($event).then(
      file => {
        if (!file)
          return;
        this.fileUploadService.uploadFile(this.connection, file, UploadType.SERVER_ICON).subscribe(state => {
          if (state.done) {
            this.serverIconUpload = undefined;
          } else {
            this.serverIconUpload = state;
          }
        }, error => this.restService.handleError(error))
      }
    )
  }

  protected addMarkdown() {
    this.server!.description.push({
      text: "",
      type: "MARKDOWN"
    } as MarkdownMessageContentDTO);
  }

  protected dropDescription(event: CdkDragDrop<any, any>) {
    const description = this.server!.description[event.previousIndex]!;
    const newOrder = event.currentIndex;
    console.log("moved description " + description.id + " from " + event.previousIndex + " -> " + event.currentIndex);
    reorderListItem(this.server!.description, description, newOrder, this.server!.description);
  }


  protected readonly asTypeMarkdown = asTypeMarkdown;

  protected onIconChange(file: FileDTO) {
    this.toastService.create({
      message: "Server icon changed",
      type: ToastType.Success
    })
  }

  protected deleteDescription(description: MessageContentDTO) {
    deleteInList(this.server!.description, description);
  }

  protected deleteIcon() {
    this.connection.rest.serverController.iconDelete(this.server!.id)
      .subscribe(_ => {
        this.toastService.create({
          message: "Server icon deleted",
          type: ToastType.Success
        })
      }, error => this.restService.handleError(error));

  }

  protected moveDescriptionUp(description: MessageContentDTO) {
    const index = this.server!.description.indexOf(description);
    this.server!.description[index] = this.server!.description[index + 1];
    this.server!.description[index + 1] = description;
  }

  protected moveDescriptionDown(description: MessageContentDTO) {
    
  }
}

export default ServerAdministrationPanel
