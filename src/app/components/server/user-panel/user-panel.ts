import { Component } from '@angular/core';
import {
  HexagonIcon,
  LogInIcon,
  LucideAngularModule,
  MicIcon, MicOffIcon,
  ScreenShareIcon, ScreenShareOffIcon,
  SettingsIcon,
  VideoIcon, VideoOffIcon
} from 'lucide-angular';
import {NgClass} from '@angular/common';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {ConnectionState} from '../../../services/websocket/WebSocketServerConnection';
import {PeerConnectionService, TrackType} from '../../../services/peer/peer-connection-service';

@Component({
  selector: 'app-user-panel',
  imports: [
    LucideAngularModule,
    NgClass
  ],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css'
})
export class UserPanel {

  protected readonly MicIcon = MicIcon;
  protected readonly VideoIcon = VideoIcon;
  protected readonly ScreenShareIcon = ScreenShareIcon;
  protected readonly SettingsIcon = SettingsIcon;
  protected readonly LogInIcon = LogInIcon;
  protected readonly HexagonIcon = HexagonIcon;

  constructor(protected webSocketService:WebSocketService,
              protected peerConnectionService: PeerConnectionService) {
  }

  protected readonly ConnectionState = ConnectionState;
  protected readonly MicOffIcon = MicOffIcon;
  protected readonly VideoOffIcon = VideoOffIcon;
  protected readonly ScreenShareOffIcon = ScreenShareOffIcon;
  protected readonly TrackType = TrackType;
}
