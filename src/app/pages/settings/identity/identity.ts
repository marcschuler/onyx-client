import {Component, inject} from '@angular/core';
import {DatePipe} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IdentityService} from '../../../services/identity-service';
import {IdentityWizzard} from './identity-wizzard/identity-wizzard';
import {SplitPanelDivider} from '../../../components/ui/split-panel/split-panel-divider/split-panel-divider';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {BUTTON_CANCEL, BUTTON_DELETE} from '../../../components/ui/dialog/dialog';
import {Identity as Ident} from '../../../services/identity-service'

@Component({
  selector: 'app-identity',
  imports: [
    DatePipe,
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
  private contextMenuService = inject(ContextMenuService);

  protected openIdentityDeleteDialog(identity: Ident) {
    this.contextMenuService.openDialog({
      title: 'Delete your identity?',
      content: 'All groups, ranks and archivements on all servers using the identity ' + identity.username + ' will be inaccessible.',
      buttons: [
        BUTTON_CANCEL,
        BUTTON_DELETE.asCallback(() => this.identityService.delete(identity))
      ]
    })
  }
}
