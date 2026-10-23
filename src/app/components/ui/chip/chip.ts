import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-chip',
  imports: [
    NgClass
  ],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {

  @Input() filled: boolean = false;

}
