import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[splitPanel]',
})
export class SplitPanelSelector {

  @Input() splitPanel!: string;

  constructor(public element: ElementRef<HTMLElement>) {}

}
