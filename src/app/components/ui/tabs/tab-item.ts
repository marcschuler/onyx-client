import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[appTabItem]',
})
export class TabItem {
  @Input() tabItem!: string;

}
