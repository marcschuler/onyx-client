import {
  Component,
  ComponentRef,
  ContentChild,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import {NgClass} from '@angular/common';
import {ContextMenuService} from '../../../services/context-menu-service';
import {Settings} from '../../../pages/settings/settings';

@Component({
  selector: 'app-popup',
  imports: [
    NgClass
  ],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  protected contextMenuService = inject(ContextMenuService);

  @Output() close = new EventEmitter<Button>();

  @Input() title?: string;
  @Input() content?: string;
  @Input() closeButton?: boolean;
  @Input() closeMenuOnClose: boolean = true;

  @Input() fullHeight = false;

  @Input() buttons?: Button[];

  @ContentChild(Settings) contentComponent!: Settings;

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
    if (button==undefined && this.closeMenuOnClose){
      if (this.contentComponent==undefined){
        console.warn("ui:popup: no content for popup but closeMenuOnClose is set")
      }else{
        this.contextMenuService.closeContextComponent(this.contentComponent);
      }
    }
    this.close.emit(button);
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
