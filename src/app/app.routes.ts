import {Routes} from '@angular/router';

export const routes: Routes = [{
  path: 'settings',
  loadComponent: () => import('./pages/settings/settings').then(s => s.Settings),
}, {
  path: 'settings/identity/new',
  loadComponent: () => import('./pages/settings/identity/identity-wizzard/identity-wizzard').then(x => x.IdentityWizzard)
}, {
  path: '',
  loadComponent: () => import('./pages/main/main').then(x => x.Main)
}];
