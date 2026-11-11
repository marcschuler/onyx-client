import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideGlobe,
  LucideKeyRound,
  LucideServer,
} from '@lucide/angular';
import {GenerateKeyPairResult} from 'jose';
import {Identity, IdentityService} from '../../../services/identity-service';
import {CryptoService} from '../../../services/crypto-service';
import {ServerLoaderService} from '../../../services/server-loader-service';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {KeyId} from '../../../services/websocket/WebSocketServerConnection';
import {BUTTON_CANCEL, BUTTON_SKIP} from '../../../components/ui/dialog/dialog';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {APP_VERSION} from '../../../services/Util';

/**
 * First-run setup: create an identity, pick community servers, done.
 */
@Component({
  selector: 'app-welcome',
  imports: [
    AsyncPipe,
    FormsModule,
    IdenticonPipe,
    LucideArrowRight,
    LucideCheck,
    LucideGlobe,
    LucideKeyRound,
    LucideServer,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  protected identityService = inject(IdentityService);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);
  private serverLoaderService = inject(ServerLoaderService);
  private contextMenuService = inject(ContextMenuService);
  private toastService = inject(ToastService);

  protected readonly steps = ['Identity', 'Servers', 'Done'];
  protected stage: WelcomeStage = WelcomeStage.IDENTITY;

  protected username = "";
  protected creating = false;
  protected identity: Identity | undefined;

  // generated up front, so the avatar preview already shows the identicon of the new identity
  private keyPair: GenerateKeyPairResult | undefined;
  protected keyId: KeyId | undefined;

  protected readonly communityServers: CommunityServer[] = [{
    name: "karlthebee.de",
    description: "",
    url: "https://onyx.karlthebee.de"
  }, {
    name: "Developer Server",
    description: "A local server for developers",
    url: "http://localhost:8080"
  }];

  protected selected = new Set<CommunityServer>();

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

    this.createKey();
  }

  protected get usernameValid() {
    return this.username.trim().length >= 3;
  }

  private async createKey() {
    this.keyPair = await this.identityService.generateKey();
    this.keyId = await this.cryptoService.generateKeyId(this.keyPair.publicKey);
  }

  protected async createIdentity() {
    if (!this.usernameValid || this.creating)
      return;
    this.creating = true;
    try {
      this.identity = await this.identityService.create(this.username.trim(), this.keyPair);
      this.stage = WelcomeStage.SERVER;
    } catch (e) {
      console.error("welcome: could not create identity", e);
      this.toastService.create({type: ToastType.Error, title: "Could not create identity"});
    } finally {
      this.creating = false;
    }
  }

  protected toggle(server: CommunityServer) {
    if (this.selected.has(server)) {
      this.selected.delete(server);
      console.log("welcome: removing server " + server.name)
    } else {
      this.selected.add(server);
      console.log("welcome: adding server " + server.name)
    }
  }

  protected skipServers() {
    this.selected.clear();
    this.stage = WelcomeStage.FINISHED;
  }

  protected finish() {
    this.selected.forEach(server => {
      this.serverLoaderService.connections.add({
        id: crypto.randomUUID(),
        name: server.name,
        url: server.url
      })
    })
    this.router.navigate(["/"]);
  }

  protected readonly WelcomeStage = WelcomeStage;
  protected readonly APP_VERSION = APP_VERSION;
}

interface CommunityServer {
  name: string;
  description: string;
  url: string;
}

export enum WelcomeStage {
  IDENTITY,
  SERVER,
  FINISHED
}
