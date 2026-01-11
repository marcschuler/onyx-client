import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-button-panel',
  imports: [],
  templateUrl: './button-panel.html',
  styleUrl: './button-panel.css'
})
export class ButtonPanel implements OnInit {

  @Input() showHeader: boolean = true;
  @Input() buttons!: TabPanelEntry[];

  @Input() selectedOption!: TabPanelEntry;
  @Output() selectedOptionChange = new EventEmitter<TabPanelEntry>();

  ngOnInit() {
    if (!this.buttons || this.buttons.length == 0)
      console.warn("Got no buttons on panel - this may crash")
    this.select(this.buttons[0]);
  }

  protected select(button: TabPanelEntry) {
    this.selectedOption = button;
    this.selectedOptionChange.emit(button);
  }
}

export interface TabPanelEntry {
  id: string;
  name: string;
}
