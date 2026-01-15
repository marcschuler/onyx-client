import {Routes} from '@angular/router';

export const routes: Routes = [{
  path: 'settings',
  loadComponent: () => import('./pages/settings/settings').then(s => s.Settings),
}, {
  path: 'welcome',
  loadComponent: () => import('./pages/intro/welcome/welcome').then(x => x.Welcome)
},{
  path: '',
  loadComponent: () => import('./pages/main/main').then(x => x.Main)
}];
