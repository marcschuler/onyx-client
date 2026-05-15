import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ui-select-item',
  imports: [],
  templateUrl: './select-item.html',
  styleUrl: './select-item.css',
})
export class SelectItem {

  @Input() label: string | any;
  @Input() value: any;


  //Parent controlled
  @Input() selected: boolean = false;
  @Output() clicked = new EventEmitter<any>();


  handleClick(): void {
    this.clicked.emit(this.value);
  }
}
