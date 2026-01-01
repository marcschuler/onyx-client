import {Component} from '@angular/core';
import {ChannelTree} from "../../components/server/channel-tree/channel-tree";
import {ChannelView} from "../main/server/channel-view/channel-view";
import {LucideAngularModule} from "lucide-angular";
import {UserPanel} from "../../components/server/user-panel/user-panel";
import {IdentityService} from '../../services/identity-service';
import {FormsModule} from '@angular/forms';
import {IdenticonPipe} from '../../pipes/identicon-pipe';
import {AsyncPipe, DatePipe, NgOptimizedImage} from '@angular/common';
import {BUTTON_CANCEL, BUTTON_DELETE, Popup} from '../../components/ui/popup/popup';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [
    ChannelTree,
    ChannelView,
    LucideAngularModule,
    UserPanel,
    FormsModule,
    IdenticonPipe,
    NgOptimizedImage,
    AsyncPipe,
    DatePipe,
    Popup,
    RouterLink
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
    }
  ]

  selectedOption: SettingsOptions = SettingsOptions.GENERAL;

  constructor(protected identityService: IdentityService,) {
  }

  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;
  protected readonly SettingsOptions = SettingsOptions;
}

enum SettingsOptions {
  GENERAL,
  IDENTITY
}
