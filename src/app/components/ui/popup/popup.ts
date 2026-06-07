import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-popup',
  imports: [
    NgClass
  ],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  @Input() isOpen = false; //TODO remove isOpen property?
  @Output() close = new EventEmitter<Button>();

  @Input() title?: string;
  @Input() content?: string;
  @Input() closeButton?: boolean;

  @Input() fullHeight = false;

  @Input() buttons?: Button[];

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
    this.close.emit(button);
    this.isOpen = false;
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
