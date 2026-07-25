import {
  Component, ComponentRef,
  ContentChild,
  EventEmitter,
  inject, Injector,
  Input,
  Output, ViewChild, ViewContainerRef,
} from '@angular/core';
import {NgClass} from '@angular/common';
import {Settings} from '../../../pages/settings/settings';
import {POPUP_CONTEXT} from '../../../services/ui/context-menu-service';

@Component({
  selector: 'app-popup',
  imports: [
    NgClass
  ],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  protected popupContext = inject(POPUP_CONTEXT);

  @Output() close = new EventEmitter<Button>();

  @Input() title?: string;
  @Input() content?: string;
  @Input() closeButton?: boolean;
  @Input() closeMenuOnClose: boolean = true;

  @Input() fullHeight = false;

  @Input() buttons?: Button[];

  @ViewChild('vc', {read: ViewContainerRef, static: true})
  vc!: ViewContainerRef;

  childRef?: ComponentRef<any>;

  attachComponent<T>(component: any, data: Partial<T> | undefined, injector: Injector) {
    this.vc.clear();

    this.childRef = this.vc.createComponent(component, {
      injector: injector
    });

    if (data && this.childRef.instance) {
      Object.assign(this.childRef.instance, data);
    }

    return this.childRef;
  }


  getButtonClass(type: ButtonType) {
    switch (type) {
      case ButtonType.DELETE:
        return "button-red";
      case ButtonType.EDIT:
        return "button";
      default:
        return "button-dark";
    }
  }

  onButton(button: Button | undefined) {
    if (button == undefined && this.closeMenuOnClose) {
      this.popupContext.close();
    }
    this.close.emit(button);
  }

  protected onOutOfBorder(event: MouseEvent) {
    if (event.target === event.currentTarget)
      this.popupContext.close();
  }
}

export enum ButtonType {
  CANCEL,
  OK,
  DELETE,
  EDIT,
}

export interface Button {
  type: ButtonType;
  text: string;
  callback: boolean;
}

export const BUTTON_CANCEL: Button = {
  text: 'Cancel',
  type: ButtonType.CANCEL,
  callback: false
} as Button;


export const BUTTON_SKIP: Button = {
  text: 'Skip',
  type: ButtonType.OK,
  callback: true
}

export const BUTTON_DELETE: Button = {
  text: 'Delete',
  type: ButtonType.DELETE,
  callback: true
}

export const BUTTON_EDIT: Button = {
  text: 'Edit',
  type: ButtonType.EDIT,
  callback: true
}
