import {Injectable} from '@angular/core';

export class Store<T> {
  state: T;

  constructor(private readonly key: string, private readonly defaultState: T) {
    this.state = this.load();
  }

  save(): void {
    localStorage.setItem(this.key, JSON.stringify(this.state));
  }

  load(): T {
    const stored = localStorage.getItem(this.key);
    try {
      this.state = stored ? JSON.parse(stored) as T : this.defaultState;
    } catch {
      this.state = this.defaultState;
    }
    return this.state;
  }
}

export class ListStore<T> extends Store<T[]> {
  constructor(key: string, defaultState: T[] = []) {
    super(key, defaultState);
  }

  add(item: T): void {
    this.state.push(item);
    this.save();
  }

  remove(item: T): void {
    const index = this.state.indexOf(item);
    if (index === -1)
      return;

    this.state.splice(index, 1);
    this.save();
  }
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  readonly interface = new Store<InterfaceSettings>('interfaceSettings', {
    channelSplitSize: {
      peerView: 70,
      messageView: 30
    },
    sidebarWidth: 200,
    compactMode: true,
    legacyChat: false
  });

  readonly gameIntegration = new Store<GameIntegrationSettings>('gameIntegration', {
    steamId64: undefined
  })

}


export interface InterfaceSettings {
  channelSplitSize: { peerView: number, messageView: number },
  sidebarWidth: number
  compactMode: boolean
  legacyChat: boolean;
}

export interface GameIntegrationSettings {
  steamId64: number | undefined;
}
