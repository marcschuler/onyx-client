import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'button[toggle-button]',
  template: '<ng-content />',
  host: {
    type: 'button',
    '[attr.aria-checked]': 'active',
    '(click)': 'toggle()',
  },
})
export class ToggleButton {
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();

  toggle() {
    this.active = !this.active;
    this.activeChange.emit(this.active);
  }
}
