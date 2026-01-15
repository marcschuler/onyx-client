import {Component} from '@angular/core';
import {IdentityWizzard} from '../../settings/identity/identity-wizzard/identity-wizzard';
import {Check, EarthLockIcon, GitPullRequest, Hand, LucideAngularModule, ServerIcon, ShieldUser} from 'lucide-angular';
import {IdentityService} from '../../../services/identity-service';
import {identifierName} from '@angular/compiler';
import {NgClass} from '@angular/common';
import {ServerConnection} from '../../../services/server-loader-service';

@Component({
  selector: 'app-welcome',
  imports: [
    IdentityWizzard,
    LucideAngularModule,
    NgClass
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {

  stage: WelcomeStage = WelcomeStage.HELLO;

  benefits = [{
    name: "Yours - truly",
    description: "Host your own server. Anytime, Anywhere.",
    icon: ServerIcon
  }, {
    name: "Private by Default",
    description: "We don't sell your data - we can't even access it.",
    icon: EarthLockIcon
  }, {
    name: "Open",
    description: "Open Source. Open Code. Open Community.",
    icon: GitPullRequest
  }]

  communityServer: {name:string,description:string,url:string}[] = [{
    name: "Local Server",
    description:"The local test server",
    url:"http://localhost:8080"
  }]

  selectedCommunityServer: {name:string,description:string,url:string}[] = [];

  constructor(protected identityService: IdentityService) {
  }

  protected finish(){

  }

  protected readonly ShieldUser = ShieldUser;
  protected readonly Hand = Hand;
  protected readonly Check = Check;
  protected readonly WelcomeStage = WelcomeStage;
  protected readonly identifierName = identifierName;
}

export enum WelcomeStage {
  HELLO,
  IDENTITY,
  FINISHED
}
