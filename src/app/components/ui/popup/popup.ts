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
  @Input() isOpen = false;
  @Output() close = new EventEmitter<ButtonType>();

  @Input() title?: string;
  @Input() content?: string;

  @Input() buttons?: Button[];

  closeDialog() {
    this.close.emit();
    this.isOpen = false;
  }

  getButtonClass(type: ButtonType) {
    switch (type) {
      case ButtonType.DELETE:
        return "button-red";
      default:
        return "button-dark";
    }
  }

  onButton(button: Button) {
    this.close.emit(button.type);
    this.isOpen = false;
  }
}

export enum ButtonType {
  CANCEL,
  OK,
  DELETE
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


export const BUTTON_DELETE: Button = {
  text: 'Delete',
  type: ButtonType.DELETE,
  callback: true
}
