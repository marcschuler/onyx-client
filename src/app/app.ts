import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {IdentityService} from './services/identity-service';
import {Toast} from './components/ui/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('webrtc-client');

  constructor(private identityService: IdentityService) {
  }
}
