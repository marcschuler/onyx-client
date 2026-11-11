import {Routes} from '@angular/router';

// developer pages, only in dev builds (ng serve). Same check as isDevMode(), but written inline so that
// production builds (where the CLI defines ngDevMode as false) drop the route and its chunk completely
const devRoutes: Routes = (typeof ngDevMode === 'undefined' || ngDevMode) ? [{
  path: 'test/ui',
  loadComponent: () => import('./pages/test/ui-test/ui-test').then(x => x.UiTest)
}] : [];

export const routes: Routes = [...devRoutes, {
  path: 'settings',
  loadComponent: () => import('./pages/settings/settings').then(s => s.Settings),
}, {
  path: 'welcome',
  loadComponent: () => import('./pages/intro/welcome/welcome').then(x => x.Welcome)
},{
  path: '',
  loadComponent: () => import('./pages/main/main').then(x => x.Main)
}];
