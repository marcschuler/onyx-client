import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterfaceService {

  settings: InterfaceSettings;

  private defaultSettings = {
    channelSplitSize: {
      peerView: 70,
      messageView: 30
    }
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

}


export interface InterfaceSettings {
  channelSplitSize: { peerView: number, messageView: number }
}
