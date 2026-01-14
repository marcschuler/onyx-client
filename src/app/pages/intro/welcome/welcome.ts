import { Component } from '@angular/core';
import {IdentityWizzard} from '../../settings/identity/identity-wizzard/identity-wizzard';
import {Check, Hand, LucideAngularModule, ShieldUser} from 'lucide-angular';
import {IdentityService} from '../../../services/identity-service';
import {identifierName} from '@angular/compiler';

@Component({
  selector: 'app-welcome',
  imports: [
    IdentityWizzard,
    LucideAngularModule
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {

  stage: WelcomeStage = WelcomeStage.HELLO;

  constructor(protected identityService:IdentityService) {
  }

  protected readonly ShieldUser = ShieldUser;
  protected readonly Hand = Hand;
  protected readonly Check = Check;
  protected readonly WelcomeStage = WelcomeStage;
  protected readonly identifierName = identifierName;
}

export enum WelcomeStage{
  HELLO,
  IDENTITY,
  FINISHED
}
