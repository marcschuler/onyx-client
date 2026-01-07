import {Component} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {UserPanel} from "../../components/server/user-panel/user-panel";
import {FormsModule} from '@angular/forms';
import {IdenticonPipe} from '../../pipes/identicon-pipe';
import {AsyncPipe, DatePipe,} from '@angular/common';
import {Popup} from '../../components/ui/popup/popup';
import {RouterLink} from '@angular/router';
import {Identity} from './identity/identity';
import {Debug} from './debug/debug';
import {Contributors} from './contributors/contributors';

@Component({
  selector: 'app-settings',
  imports: [
    LucideAngularModule,
    FormsModule,
    Identity,
    Debug,
    Contributors
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  menu: { id: SettingsOptions, name: string }[] = [
    {
      id: SettingsOptions.GENERAL,
      name: 'General',
    }, {
      id: SettingsOptions.IDENTITY,
      name: 'Identities',
    }, {
      id: SettingsOptions.CONTRIBUTORS,
      name: 'Contributors',
    }, {
      id: SettingsOptions.DEBUG,
      name: 'Debug'
    },
  ]

  selectedOption: { id: SettingsOptions, name: string } = this.menu[0];


  protected readonly SettingsOptions = SettingsOptions;
}

enum SettingsOptions {
  GENERAL,
  IDENTITY,
  DEBUG,
  CONTRIBUTORS,
}
