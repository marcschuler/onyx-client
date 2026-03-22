import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LucideAngularModule, LucideIconData} from 'lucide-angular';

@Component({
  selector: 'app-button-panel',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './button-panel.html',
  styleUrl: './button-panel.css'
})
export class ButtonPanel implements OnInit {

  @Input() showHeader: boolean = true;
  @Input() buttons!: TabPanelEntry[];

  @Input() selectedOption!: TabPanelEntry; //is undefined on init. we need a timeout because angular hates me
  @Output() selectedOptionChange = new EventEmitter<TabPanelEntry>();

  ngOnInit() {
    if (!this.buttons || this.buttons.length == 0)
      console.warn("Got no buttons on panel - this may crash")
    setTimeout(() => {
      if (this.buttons.length > 0)
        this.select(this.buttons[0])
    }, 1);
  }

  protected select(button: TabPanelEntry) {
    this.selectedOption = button;
    this.selectedOptionChange.emit(button);
  }
}

export interface TabPanelEntry {
  id: string;
  icon?: LucideIconData;
  name: string;
}
