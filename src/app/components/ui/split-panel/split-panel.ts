import {
  AfterContentInit,
  Component,
  ContentChild, ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output, QueryList, ViewChild
} from '@angular/core';
import {LucideAngularModule, LucideIconData} from 'lucide-angular';
import {SplitPanelBar} from './split-panel-bar/split-panel-bar';
import {SplitPanelSelector} from '../../../directives/split-panel-selector';
import {SplitPanelButtonEvent} from './split-panel-button/split-panel-button';

@Component({
  selector: 'ui-split-panel',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './split-panel.html',
  styleUrl: './split-panel.css'
})
export class SplitPanel implements AfterContentInit {

  @Input() header = true;
  @Input() default?: string;

  @ContentChild(SplitPanelBar) leftBar!: SplitPanelBar;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  @ContentChildren(SplitPanelSelector) contentRefs!: QueryList<SplitPanelSelector>;

  selectedOption: SplitPanelButtonEvent | undefined;

  ngAfterContentInit(): void {
    this.leftBar.onClick.subscribe((value: SplitPanelButtonEvent) => {
      console.log("ui: split-panel: button clicked")
      this.selectOption(value);
    });

    if (this.default && this.buttonsHaveValue(this.default)) {
      this.selectOption({
        value: this.default,
        name: this.default
      })
    }

    const button = this.leftBar.buttons.get(0);
    if (button) {
      this.selectOption({
        name: button.name || button.value,
        value: button.value
      })
    } else {
      console.warn("ui:split-panel: No buttons in split panel");
    }
  }


  selectOption(event: SplitPanelButtonEvent) {
    console.log("ui:split-panel: selecting button", event)
    this.selectedOption = event;
    this.leftBar.buttons.forEach(button => {
      button.onAnyButtonSelected(event)
    })
    this.setContentSlot(event);
  }

  private buttonsHaveValue(value: string) {
    return this.contentRefs.filter(child => child.splitPanel == value).length > 0;
  }

  private setContentSlot(event: SplitPanelButtonEvent) {
    this.contentRefs.forEach(child => {
      const element = child.element.nativeElement;
      const matches = child.splitPanel == event.value;
      element.style.display = matches ? '' : 'none'
    })
  }
}
