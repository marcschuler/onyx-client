import {Component, Input, inject} from '@angular/core';
import {
  LucideAngularModule,
  MicIcon, MicOffIcon,
  ScreenShareIcon, ScreenShareOffIcon,
  SettingsIcon,
  VideoIcon, VideoOffIcon
} from 'lucide-angular';
import {NgClass} from '@angular/common';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {ConnectionState, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {TrackType} from '../../../services/peer/MediaTracker';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {MediaService} from '../../../services/peer/media-service';

@Component({
  selector: 'app-user-panel',
  imports: [
    LucideAngularModule,
    NgClass,
  ],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css'
})
export class UserPanel {
  protected webSocketService = inject(WebSocketService);
  protected mediaService = inject(MediaService);


  @Input() connection!: WebSocketServerConnection;

  constructor(protected contextMenuService: ContextMenuService) {
  }

  protected readonly ConnectionState = ConnectionState;
  protected readonly MicOffIcon = MicOffIcon;
  protected readonly VideoOffIcon = VideoOffIcon;
  protected readonly ScreenShareOffIcon = ScreenShareOffIcon;
  protected readonly TrackType = TrackType;

  protected readonly MicIcon = MicIcon;
  protected readonly VideoIcon = VideoIcon;
  protected readonly ScreenShareIcon = ScreenShareIcon;
  protected readonly SettingsIcon = SettingsIcon;
}
