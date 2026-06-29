import { Component, Input, inject } from '@angular/core';
import {
  BugIcon,
  FingerprintIcon,
  IdCardLanyardIcon,
  LucideAngularModule,
  ScaleIcon, ServerIcon,
  SettingsIcon
} from "lucide-angular";
import {FormsModule} from '@angular/forms';
import {Identity} from './identity/identity';
import {Debug} from './debug/debug';
import {Contributors} from './contributors/contributors';
import {SplitPanel} from '../../components/ui/split-panel/split-panel';
import {General} from './general/general';
import {SplitPanelBar} from '../../components/ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../components/ui/split-panel/split-panel-button/split-panel-button';
import {SplitPanelSelector} from '../../directives/split-panel-selector';
import {WebSocketServerConnection} from '../../services/websocket/WebSocketServerConnection';
import {ServerUser} from './server-user/server-user';
import {SplitPanelDivider} from '../../components/ui/split-panel/split-panel-divider/split-panel-divider';
import {ServerLoaderService} from '../../services/server-loader-service';
import {ServerEditor} from './server-editor/server-editor';
import {Popup} from '../../components/ui/popup/popup';
import {ContextMenuService} from '../../services/context-menu-service';

@Component({
  selector: 'app-settings',
  imports: [
    LucideAngularModule,
    FormsModule,
    Identity,
    Debug,
    Contributors,
    SplitPanelSelector,
    General,
    SplitPanelBar,
    SplitPanelButton,
    SplitPanelSelector,
    SplitPanelSelector,
    SplitPanel,
    ServerUser,
    SplitPanelDivider,
    ServerEditor,
    Popup
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  protected serverLoaderService = inject(ServerLoaderService);
  protected contextMenuService = inject(ContextMenuService);


  @Input() connection?: WebSocketServerConnection;


  protected readonly SettingsIcon = SettingsIcon;
  protected readonly FingerprintIcon = FingerprintIcon;
  protected readonly ScaleIcon = ScaleIcon;
  protected readonly BugIcon = BugIcon;
  protected readonly IdCardLanyardIcon = IdCardLanyardIcon;
  protected readonly ServerIcon = ServerIcon;
}
