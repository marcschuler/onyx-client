import {inject, Injectable} from '@angular/core';
import {ContextMenuService} from './context-menu-service';
import {APP_VERSION} from '../Util';
import {DebugService} from '../debug-service';
import {UsersPanel} from '../../pages/main/server/users-panel/users-panel';
import {WebSocketService} from '../websocket/web-socket-service';
import {ToastService, ToastType} from './toast-service';
import {AdminPanel} from '../../pages/main/server/admin-panel/admin-panel';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  public MENU_SEPARATOR = {
    type: 'separator'
  };

  private contextMenuService = inject(ContextMenuService);
  private debugService = inject(DebugService);
  private webSocketService = inject(WebSocketService);
  private toastService = inject(ToastService);

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
        /*{
          label: 'Account on TODO'
        },*/
        this.MENU_SEPARATOR,
        {
          id: 'server-settings',
          label: 'Server Settings',
          click: () => {
            if (this.webSocketService.connection) {
              this.contextMenuService.openPopup(AdminPanel, {
                connection: this.webSocketService.connection
              })
            } else {
              this.toastService.create({
                title: "Not connected",
                message: "You need to connect to a server first",
                type: ToastType.Warning
              })
            }
          }
        }, {
          id: 'user-management',
          label: 'User Management',
          click: () => {
            if (this.webSocketService.connection) {
              this.contextMenuService.openPopup(UsersPanel, {
                connection: this.webSocketService.connection
              }, {
                fullHeight: true,
                closeButton: true
              })
            } else {
              this.toastService.create({
                title: "Not connected",
                message: "You need to connect to a server first",
                type: ToastType.Warning
              })
            }
          }
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
