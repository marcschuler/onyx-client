import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Spinner} from "../../../../../components/ui/spinner/spinner";
import {RestService} from '../../../../../services/rest-service';
import {ToastService, ToastType} from '../../../../../services/toast-service';
import {Edit1Request, ServerDTO} from '../../../../../../api/webrtc-server';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {asTypeFile, asTypeMarkdown} from '../../../../../components/chat/message-content/message-content';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import {GripVertical, LucideAngularModule, TextInitialIcon} from 'lucide-angular';
import {FileUpload} from '../../../../../components/ui/file-upload/file-upload';
import {replaceInList} from '../../../../../util';
import {deleteInList} from '../../../../../services/Util';

@Component({
  selector: 'app-server-administration-panel',
  imports: [
    ReactiveFormsModule,
    Spinner,
    FormsModule,
    CdkDragHandle,
    LucideAngularModule,
    FileUpload,
    CdkDrag,
    CdkDropList
  ],
  templateUrl: './server-administration-panel.html',
  styleUrl: './server-administration-panel.css'
})
class ServerAdministrationPanel {

  @Input() connection!: WebSocketServerConnection;

  //TODO remove and access via connection.data.server? Is this here an advantag?
  server: ServerDTO | undefined;

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }


  ngOnChanges() {
    this.update();
  }

  ngOnInit(): void {
    this.update();
  }

  update() {
    const data = this.connection.data;
    if (this.connection.data == undefined) {
      console.warn("Got no server tree?");
      console.warn(this.connection);
      console.warn(this.connection.data)
      console.warn(data);
      return;
    }
    this.connection.rest.serverController.get(this.connection.data.server.id)
      .subscribe(server => {
        this.server = server;
        console.log("got server " + JSON.stringify(server))
      }, error => {
        this.restService.handleError(error);
      })
  }

  saveServerInfo() {
    if (!this.server) {
      console.warn("No server dto avaiable - this should not happen");
      return;
    }
    this.connection.rest.serverController.edit(this.server.id, {
      name: this.server.name,
    }).subscribe(server => {
      this.server = server;
      this.toastService.create({
        title: "Server updated",
        message: "",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error));
  }

  protected addMarkdown() {
    this.connection.rest.serverDescriptionController.create(this.server!.id, {
      type: "MARKDOWN",
      text: "This is text."
    }).subscribe(description => {
        this.server!.description.push(description);
      },
      error => this.restService.handleError(error));
  }

  protected save(description: Edit1Request) {
    this.connection.rest.serverDescriptionController.edit1(this.server!.id, description.id!, description).subscribe(d => {
      replaceInList(this.server!.description, description, d);
    }, error => this.restService.handleError(error))
  }

  protected delete(description: Edit1Request) {
    this.connection.rest.serverDescriptionController._delete(this.server!.id, description.id!).subscribe(_ => {
      deleteInList(this.server!.description, description);
    }, error => this.restService.handleError(error));
  }

  protected dropDecsription(event: CdkDragDrop<any, any>) {
    const description = this.server?.description[event.previousIndex]!;
    const newOrder = event.currentIndex;
    console.log("moved description " + description.id +" from " + event.previousIndex + " -> " + event.currentIndex);
    if (event.currentIndex == event.previousIndex) {
      console.log("ignoring reordering")
      return;
    }
    this.connection.rest.serverDescriptionController.order(this.server!.id,description.id!, newOrder)
      .subscribe(() => {
        
      }, error => this.restService.handleError(error));

  }

  protected readonly asTypeMarkdown = asTypeMarkdown;
  protected readonly asTypeFile = asTypeFile;
  protected readonly GripVertical = GripVertical;
  protected readonly TextInitialIcon = TextInitialIcon;



}

export default ServerAdministrationPanel
