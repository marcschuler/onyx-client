import { Component } from '@angular/core';
import {ChannelTree} from "../../components/server/channel-tree/channel-tree";
import {ChannelView} from "../main/server/channel-view/channel-view";
import {LucideAngularModule} from "lucide-angular";
import {UserPanel} from "../../components/server/user-panel/user-panel";
import {IdentityService} from '../../services/identity-service';
import {FormsModule} from '@angular/forms';
import {IdenticonPipe} from '../../pipes/identicon-pipe';
import {AsyncPipe, DatePipe, NgOptimizedImage} from '@angular/common';

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
    DatePipe
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  constructor(protected identityService: IdentityService,) { }

}
