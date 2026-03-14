import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-chat-image',
  imports: [],
  templateUrl: './chat-image.html',
  styleUrl: './chat-image.css',
})
export class ChatImage {

  @Input() img!: string;
  @Input() title?: string;
  @Input() alt?: string;

}
