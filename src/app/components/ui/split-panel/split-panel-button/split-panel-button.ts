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
  @Output() onClick = new EventEmitter<string>();

  protected click() {
    this.onClick.emit(this.value);
  }
}
