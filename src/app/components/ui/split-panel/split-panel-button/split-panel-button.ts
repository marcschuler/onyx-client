import {Component, ContentChildren, EventEmitter, Input, Output, QueryList} from '@angular/core';
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

  @Input() value!: any;
  @Input() name?: string;
  @Input() icon: any;

  @Input() selected = false;
  @Input() childSelected = false;
  isChild: boolean = false;

  @Output() onClick = new EventEmitter<SplitPanelButtonEvent>();

  @ContentChildren(SplitPanelButton) buttons!: QueryList<SplitPanelButton>;

  ngAfterContentInit() {
    this.buttons.forEach(btn => this.subscribe(btn));

    this.buttons.changes.subscribe((list: QueryList<SplitPanelButton>) => {
      list.forEach(btn => {
        this.subscribe(btn);
      });
    });

    setTimeout(() => {
      this.buttons.forEach(button => button.isChild = true);
    })
  }

  private subscribe(button: SplitPanelButton) {
    button.onClick.subscribe((value: SplitPanelButtonEvent) => {
      this.onClick.emit(value);
    });
  }

  public onAnyButtonSelected(event: SplitPanelButtonEvent) {
    this.selected = event.value == this.value;
    this.childSelected = this.buttons.filter(b => event.value == b.value).length > 0;
    this.buttons.forEach(button => button.onAnyButtonSelected(event));
  }


  protected click() {
    this.onClick.emit({
      name: this.name || this.value,
      value: this.value
    });
  }
}

// the event that gets passed to split-panel. name may equal to value but can contain a user friendly name
export interface SplitPanelButtonEvent {
  name: string;
  value: string;
}
