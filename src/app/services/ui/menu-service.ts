import {inject, Injectable} from '@angular/core';
import {ContextMenuService} from './context-menu-service';
import {APP_VERSION} from '../Util';
import {DebugService} from '../debug-service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  public MENU_SEPARATOR = {
    type: 'separator'
  };

  private contextMenuService = inject(ContextMenuService);
  private debugService = inject(DebugService);

  menu: MenuItem[] = [
    {
      label: 'Onyx',
      submenu: [
        {
          label: 'Quit',
          role: 'quit'
        }
      ]
    }, {
      label: 'Settings',
      submenu: [{
        id: 'settings',
        label: 'Profile Settings',
        click: () => {
          this.contextMenuService.openSettingsMenu(undefined);
        }
      }, this.MENU_SEPARATOR,
        {
          label: 'Account on TODO'//TODO: account settings
        },
        this.MENU_SEPARATOR,
        {
          label: 'Server Settings (TODO)' //TODO: account settings
        }, {
          label: 'User List (TODO)' //TODO: account settings
        }

      ]
    },
    {
      label: 'Help',
      submenu: [{
        role: 'reload'
      }, {
        role: 'forceReload'
      }, {
        role: 'toggleDevTools'
      }, {
        id: 'help-toggle-debug-views',
        label: 'Toggle Debug Views',
        click: () => {
          this.debugService.debug = !this.debugService.debug;
        }
      }, this.MENU_SEPARATOR, {
        label: 'onyx v' + APP_VERSION,
      }]
    }
  ];

  init() {
    this.buildMenu();
    this.initOnClick();
  }

  buildMenu(): void {
    // remove functions because they can't be cloned by electron
    const cloned = JSON.parse(JSON.stringify(this.menu));
    window.electronAPI.setApplicationMenu(cloned);
  }

  initOnClick(): void {
    window.electronAPI.onMenuItemClick(id => {
      console.log("ui: menu-service: menu item " + id + " has been clicked");
      this.menu.forEach(m => {
        m.submenu?.forEach(m2 => {
          if (m2.id == id && m2.click) {
            m2.click();
          }
        })
      })
    });
  }


}


export interface MenuItem {
  id?: string;
  label?: string;
  click?: () => void;
  submenu?: MenuItem[];
  role?: string;
  type?: string;
}
