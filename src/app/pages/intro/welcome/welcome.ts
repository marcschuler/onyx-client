import {Component, inject} from '@angular/core';
import {IdentityWizzard} from '../../settings/identity/identity-wizzard/identity-wizzard';
import {
  Check,
  LucideAngularModule,
  Server,
  ShieldUser
} from 'lucide-angular';
import {Identity, IdentityService} from '../../../services/identity-service';
import {NgClass} from '@angular/common';
import {ServerLoaderService} from '../../../services/server-loader-service';
import {Router} from '@angular/router';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {BUTTON_CANCEL, BUTTON_SKIP} from '../../../components/ui/dialog/dialog';

@Component({
  selector: 'app-welcome',
  imports: [
    IdentityWizzard,
    LucideAngularModule,
    NgClass,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  protected identityService = inject(IdentityService);
  private router = inject(Router);
  private serverLoaderService = inject(ServerLoaderService);
  private contextMenuService = inject(ContextMenuService);


  stage: WelcomeStage = WelcomeStage.IDENTITY;
  identity: Identity | undefined;

  communityServer: { name: string, description: string, url: string }[] = [{
    name: "karlthebee ONYX Server",
    description: "Developer Server",
    url: "https://onyx.karlthebee.de"
  }, {
    name: "Local DEV Server",
    description: "A local test server",
    url: "http://localhost:8080"
  }]

  selectedCommunityServer: { name: string, description: string, url: string }[] = [];

  constructor() {
    const identityService = this.identityService;

    if (identityService.identities.length > 0) {
      this.contextMenuService.openDialog({
        title: 'You already set up your identity. Skip this?',
        content: 'You already created a Identity. You can skip this part if you want to.',
        buttons: [
          BUTTON_CANCEL,
          BUTTON_SKIP.asCallback(() => this.finish())
        ]
      })
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
  protected readonly Check = Check;
  protected readonly WelcomeStage = WelcomeStage;


  protected readonly Server = Server;
}

export enum WelcomeStage {
  IDENTITY,
  SERVER,
  FINISHED
}
