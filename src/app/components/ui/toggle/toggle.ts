import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-toggle',
  imports: [
    FormsModule
  ],
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class Toggle{

  @Input()  value!: boolean;
  @Output()  valueChange = new EventEmitter<boolean>();

  protected onChange(event:boolean) {
    this.valueChange.emit(event);
  }

}
