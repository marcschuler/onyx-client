import {Component, Input, OnInit} from '@angular/core';

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

  ngOnInit() {
    this.selectedOption = this.buttons[0];
  }

}

export interface TabPanelEntry {
  name: string;
}
