import {Component} from '@angular/core';
import {Bug, FingerprintIcon, LucideAngularModule, Scale, SettingsIcon} from "lucide-angular";
import {UserPanel} from "../../components/server/user-panel/user-panel";
import {FormsModule} from '@angular/forms';
import {IdenticonPipe} from '../../pipes/identicon-pipe';
import {AsyncPipe, DatePipe,} from '@angular/common';
import {Popup} from '../../components/ui/popup/popup';
import {RouterLink} from '@angular/router';
import {Identity} from './identity/identity';
import {Debug} from './debug/debug';
import {Contributors} from './contributors/contributors';
import {ButtonPanel, TabPanelEntry} from '../../components/ui/button-panel/button-panel';
import {General} from './general/general';

@Component({
  selector: 'app-settings',
  imports: [
    LucideAngularModule,
    FormsModule,
    Identity,
    Debug,
    Contributors,
    ButtonPanel,
    General
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  TAB_GENERAL: TabPanelEntry = {
    id: "General",
    name: 'General',
    icon: SettingsIcon
  };
  TAB_IDENTITES: TabPanelEntry = {
    id: "Identities",
    name: 'Identities',
    icon:FingerprintIcon
  };
  TAB_CONTRIBUTORS: TabPanelEntry = {
    id: "Contributors",
    name: 'Contributors & Licences',
    icon: Scale
  };
  TAB_DEBUG: TabPanelEntry = {
    id: "Debug",
    name: 'Debug',
    icon: Bug
  }

  selectedOption!: TabPanelEntry;
}
