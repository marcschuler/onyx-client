import { Component } from '@angular/core';
import {
  HexagonIcon,
  LogInIcon,
  LucideAngularModule,
  MicIcon,
  ScreenShareIcon,
  SettingsIcon,
  VideoIcon
} from 'lucide-angular';

@Component({
  selector: 'app-user-panel',
  imports: [
    LucideAngularModule
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
}
