import {Component, Input, inject} from '@angular/core';
import {
  LucideDynamicIcon,
  LucideEllipsis,
  LucideMic,
  LucideMicOff,
  LucideScreenShare,
  LucideScreenShareOff,
  LucideVideo,
  LucideVideoOff
} from '@lucide/angular';
import {NgClass} from '@angular/common';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {ConnectionState, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {TrackType} from '../../../services/peer/MediaTracker';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {MediaService} from '../../../services/peer/media-service';
import {ProfileImage} from '../../client/profile-image/profile-image';

@Component({
  selector: 'app-user-panel',
  imports: [
    LucideDynamicIcon,
    LucideEllipsis,
    NgClass,
    ProfileImage,
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
  protected readonly TrackType = TrackType;

  protected readonly LucideMic = LucideMic;
  protected readonly LucideMicOff = LucideMicOff;
  protected readonly LucideVideo = LucideVideo;
  protected readonly LucideVideoOff = LucideVideoOff;
  protected readonly LucideScreenShare = LucideScreenShare;
  protected readonly LucideScreenShareOff = LucideScreenShareOff;
}
