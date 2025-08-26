import {Component} from '@angular/core';
import {IdentityService} from '../../../../services/identity-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {Location} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-identity-wizzard',
  imports: [
    FormsModule,
    Spinner
  ],
  templateUrl: './identity-wizzard.html',
  styleUrl: './identity-wizzard.css'
})
export class IdentityWizzard {

  username: string = "";

  identityWaiting: boolean | undefined = undefined;

  constructor(private identityService: IdentityService,
              private location: Location, private router: Router) {
  }

  createIdentity() {
    this.identityWaiting = true;
    this.identityService.create(this.username)
      .then(ready => {
        setTimeout(() => {
          this.identityWaiting = false;
          this.goBack();
        }, 2000);

      })
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }


}
