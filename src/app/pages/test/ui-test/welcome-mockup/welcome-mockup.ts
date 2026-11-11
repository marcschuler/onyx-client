import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck,
  LucideGlobe,
  LucideKeyRound,
  LucideServer,
  LucideUsers,
} from '@lucide/angular';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {APP_VERSION} from '../../../../services/Util';

/**
 * Mockup of a friendlier first-run flow for pages/intro/welcome. Mock data only, nothing is saved.
 * Uses only the existing global classes (.container, .container-list, .subtitle, .detail, .chip-main,
 * .profile-big, .button-main, .button-dark, .button-text) plus Tailwind utilities.
 */
@Component({
  selector: 'app-welcome-mockup',
  imports: [
    AsyncPipe,
    FormsModule,
    IdenticonPipe,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideGlobe,
    LucideKeyRound,
    LucideServer,
    LucideUsers,
  ],
  templateUrl: './welcome-mockup.html',
})
export class WelcomeMockup {
  protected readonly steps = ['Identity', 'Servers', 'Done'];

  // fake public key for the avatar preview, the real flow generates the key pair on "Create identity"
  protected readonly previewKey = 'MCowBQYDK2VwAyEAe5Fg7Hj9Kl1Mn3Pq5Rs7Tu9Vw1Xy3Za5Bc7De9Fg1Hi=';

  protected readonly servers: MockServer[] = [
    {
      name: 'Onyx Community', url: 'community.onyx.example', members: 1240, recommended: true,
      description: 'News, help and feedback around onyx.',
    },
    {
      name: 'Gaming Lounge', url: 'games.example.org', members: 380, recommended: false,
      description: 'Find people to play with, one voice channel per game.',
    },
    {
      name: 'Open Source Hub', url: 'oss.example.net', members: 512, recommended: false,
      description: 'Talk about open source projects and get help.',
    },
  ];

  protected stage = 0;
  protected username = '';
  protected selected = new Set<MockServer>([this.servers[0]]);

  protected readonly APP_VERSION = APP_VERSION;

  protected get usernameValid() {
    return this.username.trim().length >= 3;
  }

  protected createIdentity() {
    if (this.usernameValid)
      this.stage = 1;
  }

  protected toggle(server: MockServer) {
    if (this.selected.has(server))
      this.selected.delete(server);
    else
      this.selected.add(server);
  }

  protected restart() {
    this.stage = 0;
    this.username = '';
    this.selected = new Set<MockServer>([this.servers[0]]);
  }
}

interface MockServer {
  name: string;
  url: string;
  description: string;
  members: number;
  recommended: boolean;
}
