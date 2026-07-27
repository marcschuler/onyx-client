import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {POPUP_CONTEXT} from '../../../services/ui/context-menu-service';

@Component({
  selector: 'app-dialog',
  imports: [
    NgClass
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class Dialog implements DialogData {

  @Input() title?: string;
  @Input() content?: string;
  @Input() closeButton?: boolean;
  @Input() buttons?: Button[];
  @Output() close = new EventEmitter<Button>();
  onClose?: (button: Button) => void | undefined;


  private popupContext = inject(POPUP_CONTEXT);

  onButtonClick(button: Button | undefined) {
    if (button) {
      if (button.callback)
        button.callback();
      if (this.onClose)
        this.onClose(button);
    }
    this.close.emit(button);
    this.popupContext.close();
  }

}

export class Button {
  readonly text: string;
  readonly cssClass: string | undefined;
  readonly callback: (() => void) | undefined;

  constructor(text: string, cssClass: string | undefined, callback: (() => void) | undefined) {
    this.text = text;
    this.cssClass = cssClass;
    this.callback = callback;
  }

  asCallback(callback: (() => void) | undefined) {
    return new Button(this.text, this.cssClass, callback);
  }
}

export const BUTTON_CANCEL: Button = new Button('Cancel', undefined, undefined)
export const BUTTON_SKIP: Button = new Button('Skip', undefined, undefined);
export const BUTTON_DELETE: Button = new Button('Delete', 'button-red', undefined)
export const BUTTON_EDIT: Button = new Button('Edit', 'button', undefined)

export interface DialogData {
  title?: string;
  content?: string;
  closeButton?: boolean;
  buttons?: Button[];
  onClose?: (button: Button) => void | undefined;
}
