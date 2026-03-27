import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../../services/rest-service';
import {ToastService, ToastType} from '../../../../../services/toast-service';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import {SectionDTO} from '../../../../../../api/webrtc-server/model/sectionDTO';
import {CircleMinus, GripVertical, LucideAngularModule, Pencil} from 'lucide-angular';
import {Button, BUTTON_CANCEL, BUTTON_DELETE, Popup} from '../../../../../components/ui/popup/popup';
import {ChannelDTO, SectionExtendedDTO, ServerTreeChangeMessage} from '../../../../../../api/webrtc-server';
import {NameDescriptionPopup} from './name-description-popup/name-description-popup';
import {ChannelEditor} from '../../../../../components/channel/channel-editor/channel-editor';

@Component({
  selector: 'app-channel-administration-panel',
  imports: [
    CdkDropList,
    CdkDrag,
    LucideAngularModule,
    Popup,
    NameDescriptionPopup,
    CdkDragHandle,
    ChannelEditor,
  ],
  templateUrl: './channel-administration-panel.html',
  styleUrl: './channel-administration-panel.css'
})
export class ChannelAdministrationPanel implements OnInit, OnChanges {

  @Input() connection!: WebSocketServerConnection;
  @Input() serverTree!: ServerTreeChangeMessage;

  protected channelToDelete: ChannelDTO | undefined;
  protected channelToEdit: ChannelDTO | undefined;


  protected sectionToDelete: SectionDTO | undefined;
  protected sectionToEdit: SectionDTO | undefined;

  dropListSections: string[] = [];

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
    this.dropListSections = this.connection.data!.sections.map(s => 'droplist-section-' + s.id);
  }

  protected dropChannel(event: CdkDragDrop<SectionExtendedDTO, any>) {
    const channel = (event.previousContainer.data as SectionDTO).channels[event.previousIndex];
    const newOrder = event.currentIndex;
    console.log("moved channel " + channel.name + " (" + channel.id + ") to order " + newOrder + " (from " + event.previousIndex + ")")

    if (event.previousContainer === event.container) {
      if (event.currentIndex == event.previousIndex) {
        console.log("ignoring reordering")
        return;
      }
      this.connection.rest.channelController.order1(channel.id, newOrder)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    } else {
      console.log("  -> also changed section " + event.previousContainer.data.name + "(" + event.previousContainer.data.id + ") -> " + event.container.data.name + "(" + event.container.data.id + ")")
      this.connection.rest.channelController.move(channel.id, event.container.data.id, newOrder)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    }
  }

  protected dropSection(event: CdkDragDrop<SectionDTO, any>) {
    const section = this.connection.data!.sections[event.previousIndex];
    const newOrder = event.currentIndex;
    console.log("moved section " + section.name + " (" + section.id + ") from " + event.previousIndex + " -> " + event.currentIndex);
    if (event.currentIndex == event.previousIndex) {
      console.log("ignoring reordering")
      return;
    }
    this.connection.rest.sectionController.order(section.id, newOrder)
      .subscribe(() => {
      }, error => this.restService.handleError(error));
  }

  protected createChannel(section: SectionDTO) {
    this.connection.rest.channelController.create3({
      name: "Channel",
      sectionId: section.id,
      order: section.channels.length,
      policies:{}
    }).subscribe(value => {
      this.toastService.create({
        title: "Channel created",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error))
  }

  protected createSection() {
    this.connection.rest.sectionController.create({
      name: "Section"
    }).subscribe(value => {
      this.toastService.create({
        title: "Section created",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error))
  }

  protected editChannel(event: any) {
    if (event == undefined) {
      this.channelToEdit = undefined;
      return;
    }
    this.connection.rest.channelController.edit4(this.channelToEdit!.id, event)
      .subscribe(() => {
      }, error => this.restService.handleError(error), () => this.channelToEdit = undefined);
  }

  protected editSection(event: any) {
    if (event == undefined) {
      this.sectionToDelete = undefined;
      return;
    }
    this.connection.rest.sectionController.edit1(this.sectionToEdit!.id, event)
      .subscribe(() => {
      }, error => this.restService.handleError(error), () => this.sectionToEdit = undefined);
  }

  protected deleteChannel(type: Button) {
    if (type == BUTTON_DELETE) {
      this.connection.rest.channelController.delete3(this.channelToDelete!.id)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    }
    this.channelToDelete = undefined;
  }

  protected deleteSection(type: Button) {
    if (type == BUTTON_DELETE) {
      this.connection.rest.sectionController._delete(this.sectionToDelete!.id)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    }
    this.sectionToDelete = undefined;
  }

  protected readonly CircleMinus = CircleMinus;
  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;


  protected readonly Pencil = Pencil;


  protected readonly GripVertical = GripVertical;


}
