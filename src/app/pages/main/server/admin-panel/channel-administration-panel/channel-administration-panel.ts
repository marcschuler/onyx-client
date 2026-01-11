import {Component, Input} from '@angular/core';
import {WebSocketServerConnection} from '../../../../../services/websocket/WebSocketServerConnection';
import {RestService} from '../../../../../services/rest-service';
import {ToastService, ToastType} from '../../../../../services/toast-service';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {SectionDTO} from '../../../../../../api/webrtc-server/model/sectionDTO';
import {CircleMinus, LucideAngularModule} from 'lucide-angular';
import {Button, BUTTON_CANCEL, BUTTON_DELETE, Popup} from '../../../../../components/ui/popup/popup';
import {ChannelDTO} from '../../../../../../api/webrtc-server';
import {NameDescriptionPopup} from './name-description-popup/name-description-popup';

@Component({
  selector: 'app-channel-administration-panel',
  imports: [
    CdkDropList,
    CdkDrag,
    LucideAngularModule,
    Popup,
    NameDescriptionPopup
  ],
  templateUrl: './channel-administration-panel.html',
  styleUrl: './channel-administration-panel.css'
})
export class ChannelAdministrationPanel {

  @Input() connection!: WebSocketServerConnection;

  protected channelToDelete: ChannelDTO | undefined;
  dropListSections: string[] = [];

  constructor(private restService: RestService,
              private toastService: ToastService) {
  }


  ngOnChanges() {
  }

  ngOnInit(): void {
    this.update();
  }

  //TODO update when server tree changes
  update() {
    this.dropListSections = this.connection.data!.sections.map(s => 'droplist-section-' + s.id);
  }

  protected drop(event: CdkDragDrop<SectionDTO, any>) {
    const channel = (event.previousContainer.data as SectionDTO).channels[event.previousIndex];
    const newOrder = event.currentIndex;
    console.log("moved channel " + channel.name + " (" + channel.id + ") to order " + newOrder + " (from " + event.previousIndex + ")")

    if (event.previousContainer === event.container) {
      if (event.currentIndex == event.previousIndex) {
        console.log("ignoring reordering")
        return;
      }
      this.connection.rest.channelController.order(channel.id, newOrder)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    } else {
      console.log("  -> also changed section " + event.previousContainer.data.name + "(" + event.previousContainer.data.id + ") -> " + event.container.data.name + "(" + event.container.data.id + ")")
      this.connection.rest.channelController.move(channel.id, event.container.data.id, newOrder)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    }
  }

  protected createChannel(section: SectionDTO) {
    this.connection.rest.channelController.create1({
      name: "Channel",
      sectionId: section.id,
      order: section.channels.length
    }).subscribe(value => {
      this.toastService.create({
        title: "Channel created",
        type: ToastType.Success
      })
    }, error => this.restService.handleError(error))
  }

  protected deleteChannel(type: Button) {
    if (type == BUTTON_DELETE) {
      this.connection.rest.channelController.delete1(this.channelToDelete!.id)
        .subscribe(value => {
        }, error => this.restService.handleError(error))
    }
    this.channelToDelete = undefined;
  }

  protected readonly CircleMinus = CircleMinus;
  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;


}
