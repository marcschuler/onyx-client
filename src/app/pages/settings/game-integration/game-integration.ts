import {Component, inject, OnInit} from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {LucideSave, LucideTrash} from '@lucide/angular';
import {FormsModule} from '@angular/forms';
import {WebSocketService} from '../../../services/websocket/web-socket-service';
import {GameIntegrationRequest} from '../../../../api/onyx-server';

@Component({
  selector: 'app-game-integration',
  imports: [
    LucideSave,
    FormsModule,
    LucideTrash
  ],
  templateUrl: './game-integration.html',
  styleUrl: './game-integration.css',
})
export class GameIntegration implements OnInit {

  protected webSocketService = inject(WebSocketService);
  private storageService = inject(StorageService);


  steamId64 = "";
  steamId64Invalid = false;

  ngOnInit(): void {
    const id = this.storageService.gameIntegration.state.steamId64;
    this.steamId64 = id ? id.toString() : "";
  }

  onSteamId64Change(value: string) {
    this.steamId64 = value;
    this.steamId64Invalid = value.trim() !== "" && !this.isValidSteamId64(value);
  }

  isValidSteamId64(value: string | undefined): boolean {
    if (!value)
      return false;

    const steamId = value.trim();
    if (!/^\d{17}$/.test(steamId))
      return false;

    const numericId = BigInt(steamId);
    return numericId >= 76561197960265728n && numericId <= 18446744073709551615n;
  }

  save() {
    this.storageService.gameIntegration.state.steamId64 = this.isValidSteamId64(this.steamId64) ? Number(this.steamId64) : undefined;
    this.storageService.gameIntegration.save();

    const steamId64 = this.storageService.gameIntegration.state.steamId64;
    if (this.webSocketService.connection)
      this.webSocketService.send(this.webSocketService.connection, {
        steamId64: steamId64 ? steamId64 : undefined,
        type: "GameIntegrationRequest"
      } as GameIntegrationRequest)
  }

  protected deleteSteamId() {
    this.steamId64 = '';
    this.save();
  }
}
