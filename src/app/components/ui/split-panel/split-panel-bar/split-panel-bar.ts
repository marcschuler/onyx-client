import {Component, ContentChildren, EventEmitter, Output, QueryList, AfterContentInit} from '@angular/core';
import {SplitPanelButton, SplitPanelButtonEvent} from '../split-panel-button/split-panel-button';

@Component({
  selector: 'ui-split-panel-bar',
  imports: [],
  templateUrl: './split-panel-bar.html',
  styleUrl: './split-panel-bar.css',
})
export class SplitPanelBar implements AfterContentInit {

  @Output() onClick = new EventEmitter<SplitPanelButtonEvent>();

  @ContentChildren(SplitPanelButton) buttons!: QueryList<SplitPanelButton>;

  ngAfterContentInit() {
    this.buttons.forEach(btn => this.subscribe(btn));

    this.buttons.changes.subscribe((list: QueryList<SplitPanelButton>) => {
      list.forEach(btn => this.subscribe(btn));
    });
  }

  private subscribe(button: SplitPanelButton) {
    button.onClick.subscribe((value: SplitPanelButtonEvent) => {
      this.onClick.emit(value);
    });
  }
}
