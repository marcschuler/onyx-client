import {ComponentRef, inject, Injectable, InjectionToken, Injector, runInInjectionContext, Type} from '@angular/core';

import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Client, WebSocketServerConnection} from '../websocket/WebSocketServerConnection';
import {ClientContextMenu} from '../../components/client/client-context-menu/client-context-menu';
import {MENU_STACK, MenuStack} from '@angular/cdk/menu';
import {ChannelDTO} from '../../../api/onyx-server';
import {ChannelContextMenu} from '../../components/channel/channel-context-menu/channel-context-menu';
import {Settings} from '../../pages/settings/settings';
import {BiMap} from 'mnemonist';
import {Popup} from '../../components/ui/popup/popup';
import {WebSocketService} from '../websocket/web-socket-service';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {

  overlay = inject(Overlay);
  injector = inject(Injector);
  webSocketService = inject(WebSocketService);

  private popups: BiMap<any, OverlayRef> = new BiMap();

  constructor() {
    this.webSocketService.onServerClose.subscriber().subscribe(()=>{
      console.log("ui:context: closing " + this.popups.size + " popups because server connection closed");
      this.popups.forEach(popup=>{
        this.closeContextMenu(popup);
      })
    })
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
    }, {
      closeButton: true,
      fullHeight: true
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
    event.stopPropagation();
    event.preventDefault();

    menu.backdropClick().subscribe(() => this.closeContextMenu(menu));
    const portal = new ComponentPortal(component, null, this.buildInjector(menu));
    const componentRef = menu.attach(portal);
    this.popups.set(componentRef.instance, menu);
    console.log("ui:context: created menu")

    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });
    }
    return {menu, componentRef};
  }

  public openPopup<T>(component: Type<T>, inputs?: Partial<T>, popupSettings?: PopupSettings) {
    const menu = this.overlay.create({
      positionStrategy: this.overlay.position().global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
    });


    menu.backdropClick().subscribe(() => this.closeContextMenu(menu));
    const portal = new ComponentPortal(Popup, null, this.buildInjector(menu));
    const componentRef = menu.attach(portal);
    if (popupSettings)
      Object.entries(popupSettings).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });

    this.popups.set(componentRef.instance, menu);
    console.log("ui:context: created menu")

    componentRef.instance.attachComponent(component, inputs, this.buildInjector(menu));

    return {menu, componentRef};
  }

  protected buildInjector(menu: OverlayRef) {
    const menuStack = runInInjectionContext(this.injector, () => MenuStack.inline('vertical'));
    return Injector.create({
      providers: [
        {provide: MENU_STACK, useValue: menuStack},
        {
          provide: POPUP_CONTEXT,
          useValue: {
            close: () => this.closeContextMenu(menu)
          } as PopupControl,
        },
      ],
      parent: this.injector,
    });
  }

  public closeContextComponent(component: any) {
    if (!this.popups.has(component)) { //it's a component => close it
      console.warn("ui:context: no overlay for component", component)
    }
    const overlay = this.popups.get(component) as OverlayRef;
    console.log("ui:context: closing component")
    overlay.detach();
    overlay.dispose();

    this.popups.delete(component);
  }

  public closeContextMenu(overlay: OverlayRef) {
    this.popups.inverse.delete(overlay);
    console.log("ui:context: closing overlay")
    overlay.detach();
    overlay.dispose();
  }
}


export const POPUP_CONTEXT = new InjectionToken<PopupControl>('POPUP_CLOSE');

export interface PopupControl {
  close: () => void;
}

export interface PopupSettings {
  closeButton: boolean;
  fullHeight: boolean;
}
