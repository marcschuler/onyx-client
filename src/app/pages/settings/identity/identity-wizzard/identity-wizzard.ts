import {Component} from '@angular/core';
import {IdentityService} from '../../../../services/identity-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {AsyncPipe, Location} from '@angular/common';
import {Router} from '@angular/router';
import {CryptoService} from '../../../../services/crypto-service';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {KeyIDPipe} from '../../../../pipes/key-id-pipe';
import {LucideAngularModule, RotateCcw} from 'lucide-angular';


@Component({
  selector: 'app-identity-wizzard',
  imports: [
    FormsModule,
    Spinner,
    IdenticonPipe,
    AsyncPipe,
    KeyIDPipe,
    LucideAngularModule
  ],
  templateUrl: './identity-wizzard.html',
  styleUrl: './identity-wizzard.css'
})
export class IdentityWizzard {

  username: string = "";
  key: CryptoKeyPair | undefined;

  identityWaiting: boolean | undefined = undefined;

  constructor(protected identityService: IdentityService,
              private location: Location, private router: Router) {
    this.createKey();
  }

  async createKey() {
    this.key = await this.identityService.generateKey();
  }

  createIdentity() {
    this.identityWaiting = true;
    this.identityService.create(this.username, this.key)
      .then(ready => {
        this.identityWaiting = false;
        this.goBack();
      })
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }


  protected readonly RotateCcw = RotateCcw;
}
