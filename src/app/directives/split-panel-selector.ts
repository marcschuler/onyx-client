import { Directive, ElementRef, Input, inject } from '@angular/core';

@Directive({
  selector: '[splitPanel]',
})
export class SplitPanelSelector {
  element = inject<ElementRef<HTMLElement>>(ElementRef);


  @Input() splitPanel!: any;

}
