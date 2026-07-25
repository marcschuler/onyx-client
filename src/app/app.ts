import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Toast} from './components/ui/toast/toast';
import {MenuService} from './services/ui/menu-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('webrtc-client');
  private menuService = inject(MenuService);

  ngOnInit(): void {
    this.menuService.init();
  }
}
