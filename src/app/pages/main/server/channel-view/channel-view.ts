import {Component, Input} from '@angular/core';
import {ServerObjectId} from '../../../../services/websocket/WebSocketEvents';
import {BrushCleaningIcon, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-channel-view',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView {

  @Input() channelId!: ServerObjectId;

  protected readonly BrushCleaningIcon = BrushCleaningIcon;
}
