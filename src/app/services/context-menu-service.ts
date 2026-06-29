import {ComponentRef, Injectable, Injector, runInInjectionContext, Type} from '@angular/core';

import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Client, WebSocketServerConnection} from './websocket/WebSocketServerConnection';
import {ClientContextMenu} from '../components/client/client-context-menu/client-context-menu';
import {MENU_STACK, MenuStack} from '@angular/cdk/menu';
import {ChannelDTO} from '../../api/webrtc-server';
import {ChannelContextMenu} from '../components/channel/channel-context-menu/channel-context-menu';
import {Settings} from '../pages/settings/settings';
import {BiMap} from 'mnemonist';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {

  private popups: BiMap<any, OverlayRef> = new BiMap();

  constructor(private overlay: Overlay, private injector: Injector) {
  }

  public openChannelContextMenu(channel: ChannelDTO, connection: WebSocketServerConnection, event: MouseEvent) {
    this.openContextMenu(ChannelContextMenu, event, {
      channel: channel,
      connection: connection,
    })
  }

  public openClientContextMenu(client: Client, connection: WebSocketServerConnection, event: MouseEvent) {
    this.openContextMenu(ClientContextMenu, event, {
      client: client,
      connection: connection,
    })
  }

  public openSettingsMenu(connection: WebSocketServerConnection | undefined) {
    this.openPopup(Settings, {
      connection: connection,
    })
  }

  public openContextMenu<T>(component: Type<T>, event: MouseEvent, inputs?: Partial<T>) {
    const menu = this.overlay.create({
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo({x: event.clientX, y: event.clientY})
        .withPositions([{
          originX: 'start', originY: 'top',
          overlayX: 'start', overlayY: 'top',
        }]),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
    });
    return this.openMenu(menu, component, inputs);
  }

  public openPopup<T>(component: Type<T>, inputs?: Partial<T>) {
    const menu = this.overlay.create({
      positionStrategy: this.overlay.position().global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      width: '95vw',
      height: '90vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      minWidth: '95vw',
      minHeight: '90vh',
    });
    return this.openMenu(menu, component, inputs);
  }


  public openMenu<T>(menu: OverlayRef, component: Type<T>, inputs?: Partial<T>) {
    menu.backdropClick().subscribe(() => this.closeContextMenu(menu));
    const menuStack = runInInjectionContext(this.injector, () => MenuStack.inline('vertical'));
    const injector = Injector.create({
      providers: [
        {provide: MENU_STACK, useValue: menuStack},
      ],
      parent: this.injector,
    });
    const portal = new ComponentPortal(component, null, injector);
    const componentRef = menu.attach(portal);

    this.popups.set(componentRef.instance, menu);
    console.log("created popup", componentRef,menu)

    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });
    }
    return menu;
  }

  public closeContextComponent(component: any) {
    if (!this.popups.has(component)) { //it's a component => close it
      console.warn("ui:context: no overlay for component", component)
    }
    const overlay = this.popups.get(component) as OverlayRef;
    overlay.detach();
    overlay.dispose();

    this.popups.delete(component);
    console.log("context: closed component")
  }

  public closeContextMenu(overlay: OverlayRef) {
    this.popups.inverse.delete(overlay);
    console.log("context: closed overlay")
    overlay.detach();
    overlay.dispose();
  }
}
