import { Component, inject } from '@angular/core';
import {IdentityWizzard} from '../../settings/identity/identity-wizzard/identity-wizzard';
import {
  Check,
  Hand,
  LucideAngularModule,
  Server,
  ShieldUser
} from 'lucide-angular';
import {Identity, IdentityService} from '../../../services/identity-service';
import {identifierName} from '@angular/compiler';
import {NgClass} from '@angular/common';
import { ServerLoaderService} from '../../../services/server-loader-service';
import { Router} from '@angular/router';
import {Button, BUTTON_CANCEL, BUTTON_DELETE, BUTTON_SKIP, Popup} from '../../../components/ui/popup/popup';

@Component({
  selector: 'app-welcome',
  imports: [
    IdentityWizzard,
    LucideAngularModule,
    NgClass,
    Popup
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  protected identityService = inject(IdentityService);
  private router = inject(Router);
  private serverLoaderService = inject(ServerLoaderService);


  stage: WelcomeStage = WelcomeStage.IDENTITY;
  identity: Identity | undefined;
  warnDuplicate = false;

  communityServer: { name: string, description: string, url: string }[] = [{
    name: "karlthebee ONYX Server",
    description: "Developer Server",
    url: "https://onyx.karlthebee.de"
  },{
    name: "Local DEV Server",
    description: "A local test server",
    url: "http://localhost:8080"
  }]

  selectedCommunityServer: { name: string, description: string, url: string }[] = [];

  constructor() {
    const identityService = this.identityService;

    if (identityService.identities.length>0){
      this.warnDuplicate= true;
    }
  }

  protected onServerSelect(event: Event, server: { name: string; description: string; url: string }) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedCommunityServer.push(server);
      console.log("welcome: adding server " + server.name)
    } else {
      const index = this.selectedCommunityServer.indexOf(server);
      this.selectedCommunityServer.splice(index, 1);
      console.log("welcome: removing server " + server.name)
    }
  }

  protected onIdentity(identity: Identity) {
    this.stage = WelcomeStage.SERVER;
    this.identity = identity;
  }

  protected onWarnDuplicate($event: Button) {
    if ($event==BUTTON_SKIP){
      this.finish();
    }else{
      this.warnDuplicate = false;
    }
  }

  protected finish() {
    this.selectedCommunityServer.forEach(server => {
      this.serverLoaderService.addServer({
        id: crypto.randomUUID(),
        name: server.name,
        url: server.url
      })
    })
    this.router.navigate(["/"]);
  }

  protected readonly ShieldUser = ShieldUser;
  protected readonly Hand = Hand;
  protected readonly Check = Check;
  protected readonly WelcomeStage = WelcomeStage;
  protected readonly identifierName = identifierName;




  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_DELETE = BUTTON_DELETE;
  protected readonly BUTTON_SKIP = BUTTON_SKIP;


  protected readonly Server = Server;
}

export enum WelcomeStage {
  IDENTITY,
  SERVER,
  FINISHED
}
