import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {Identity, IdentityService} from '../../../../services/identity-service';
import {FormsModule} from '@angular/forms';
import {Spinner} from '../../../../components/ui/spinner/spinner';
import {AsyncPipe, Location} from '@angular/common';
import {Router} from '@angular/router';
import {CryptoService} from '../../../../services/crypto-service';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {KeyIDPipe} from '../../../../pipes/key-id-pipe';
import {LucideAngularModule, RotateCcw} from 'lucide-angular';
import {KeyVisualizer} from '../../../../components/ui/key-visualizer/key-visualizer';


@Component({
  selector: 'app-identity-wizzard',
  imports: [
    FormsModule,
    Spinner,
    AsyncPipe,
    KeyIDPipe,
    LucideAngularModule,
    KeyVisualizer
  ],
  templateUrl: './identity-wizzard.html',
  styleUrl: './identity-wizzard.css'
})
export class IdentityWizzard {
  protected identityService = inject(IdentityService);
  private location = inject(Location);
  private router = inject(Router);


  username = "";
  key: CryptoKeyPair | undefined;

  @Input() showDots = true;

  @Output() identityCreated = new EventEmitter<Identity>();

  identityWaiting: boolean | undefined = undefined;

  constructor() {
    this.createKey();
  }

  async createKey() {
    this.key = await this.identityService.generateKey();
  }

  createIdentity() {
    this.identityWaiting = true;
    this.identityService.create(this.username, this.key)
      .then(identity => {
        this.identityWaiting = false;
        this.identityCreated.emit(identity);
        this.createKey();
      })
  }

  protected readonly RotateCcw = RotateCcw;
}
