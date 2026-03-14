import { Injectable } from '@angular/core';

import {ipcRenderer} from 'electron';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {


  public openChannelContexMenu(){
    //TODO does not work ipcRenderer.send('context-menu');
  }

}
