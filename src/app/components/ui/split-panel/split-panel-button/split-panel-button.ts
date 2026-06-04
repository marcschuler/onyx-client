import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'ui-split-panel-button',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './split-panel-button.html',
  styleUrl: './split-panel-button.css',
})
export class SplitPanelButton {

  @Input() value!: string;
  @Input() name?: string;
  @Input() icon: any;

  @Input() selected: boolean = false;
  @Output() onClick = new EventEmitter<SplitPanelButtonEvent>();

  protected click() {
    this.onClick.emit({
      name: this.name || this.value,
      value: this.value
    });
  }
}

// the event that gets passed to split-panel. name may equal to value but can contain a user friendly name
export interface SplitPanelButtonEvent{
  name: string;
  value: string;
}
