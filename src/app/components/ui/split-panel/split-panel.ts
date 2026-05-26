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

@Component({
  selector: 'ui-split-panel',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './split-panel.html',
  styleUrl: './split-panel.css'
})
export class SplitPanel implements AfterContentInit {

  @Input() header: boolean = true;
  @Input() default?: string;

  @ContentChild(SplitPanelBar) leftBar!: SplitPanelBar;
  @ViewChild('content') content!: ElementRef<HTMLElement>;
  @ContentChildren(SplitPanelSelector) contentRefs!: QueryList<SplitPanelSelector>;

  selectedOption: string | undefined;

  ngAfterContentInit(): void {
    this.leftBar.onClick.subscribe((value: string) => {
      this.selectOption(value);
    });

    if (this.default && this.buttonsHaveValue(this.default)) {
      this.selectOption(this.default)
    }

    const button = this.leftBar.buttons.get(0);
    if (button) {
      this.selectOption(button.value)
    } else {
      console.warn("No buttons in split panel");
    }
  }


  selectOption(option: string) {
    console.log("selecting " + option)
    this.selectedOption = option;
    this.leftBar.buttons.forEach(button => {
      button.selected = (button.value == option);
    })
    this.setContentSlot(option);
  }

  private buttonsHaveValue(value: string) {
    return this.contentRefs.filter(child => child.splitPanel == value).length > 0;
  }

  private setContentSlot(value: string) {
    console.log("childs " + this.contentRefs.length)
    this.contentRefs.forEach(child => {
      const element = child.element.nativeElement;
      const matches = child.splitPanel == value;
      console.log("child matches?" + matches)
      element.style.display = matches ? '' : 'none'
    })
  }
}

export interface TabPanelEntry {
  id: string;
  icon?: LucideIconData;
  name: string;
}
