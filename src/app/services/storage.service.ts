import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  settings: InterfaceSettings;

  private defaultSettings: InterfaceSettings = {
    channelSplitSize: {
      peerView: 70,
      messageView: 30
    },
    sidebarWidth: 200,
    compactMode: false,
    legacyChat: false
  };

  constructor() {
    const settings = localStorage.getItem('interfaceSettings')
    if (settings) {
      this.settings = JSON.parse(settings);
    } else {
      this.settings = this.defaultSettings
    }
  }

  saveSettings() {
    localStorage.setItem('interfaceSettings', JSON.stringify(this.settings));
  }

  getUserPreference(id: string): UserPreference | undefined {
    const preference = localStorage.getItem("userPreference-" + id);
    if (preference) {
      return JSON.parse(preference);
    } else {
      return undefined;
    }
  }

  saveUserPreference(preference: UserPreference) {
    const str = JSON.stringify(preference);
    localStorage.setItem('userPreference-' + preference.id, str);
  }

}


export interface InterfaceSettings {
  channelSplitSize: { peerView: number, messageView: number },
  sidebarWidth: number
  compactMode: boolean
  legacyChat: boolean;
}

export interface UserPreference {
  id: string;
  volume: number;
}
