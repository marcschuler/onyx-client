import { Component, inject } from '@angular/core';
import {DatePipe} from "@angular/common";
import {Button, BUTTON_CANCEL, BUTTON_DELETE, Popup} from "../../../components/ui/popup/popup";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IdentityService} from '../../../services/identity-service';
import {Identity as IdentityDTO} from '../../../services/identity-service';
import {IdentityWizzard} from './identity-wizzard/identity-wizzard';
import {SplitPanelDivider} from '../../../components/ui/split-panel/split-panel-divider/split-panel-divider';

@Component({
  selector: 'app-identity',
  imports: [
    DatePipe,
    Popup,
    ReactiveFormsModule,
    FormsModule,
    IdentityWizzard,
    SplitPanelDivider
  ],
  templateUrl: './identity.html',
  styleUrl: './identity.css'
})
export class Identity {
  protected identityService = inject(IdentityService);


  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;


  identityToDelete?: IdentityDTO;

  closeIdentityDialog(type: Button) {
    if (type == BUTTON_DELETE) {
      this.identityService.delete(this.identityToDelete!);
    }
    this.identityToDelete = undefined;
  }

}
