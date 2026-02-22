import {Component} from '@angular/core';
import {AsyncPipe, DatePipe} from "@angular/common";
import {IdenticonPipe} from "../../../pipes/identicon-pipe";
import {Button, BUTTON_CANCEL, BUTTON_DELETE, Popup} from "../../../components/ui/popup/popup";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {IdentityService} from '../../../services/identity-service';
import {Identity as IdentityDTO} from '../../../services/identity-service';
import {IdentityWizzard} from './identity-wizzard/identity-wizzard';

@Component({
  selector: 'app-identity',
  imports: [
    AsyncPipe,
    DatePipe,
    IdenticonPipe,
    Popup,
    ReactiveFormsModule,
    FormsModule,
    IdentityWizzard
  ],
  templateUrl: './identity.html',
  styleUrl: './identity.css'
})
export class Identity {

  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;


  identityToDelete?: IdentityDTO;

  constructor(protected identityService: IdentityService) {

  }

  closeIdentityDialog(type: Button) {
    if (type == BUTTON_DELETE) {
      this.identityService.delete(this.identityToDelete!);
    }
    this.identityToDelete = undefined;
  }

}
