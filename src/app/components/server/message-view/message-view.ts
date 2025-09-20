import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrushCleaningIcon, LucideAngularModule, SendIcon} from 'lucide-angular';

@Component({
  selector: 'app-message-view',
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './message-view.html',
  styleUrl: './message-view.css'
})
export class MessageView {

  protected readonly SendIcon = SendIcon;

  message: string = "";

  sendMessage() {

  }

  protected readonly BrushCleaningIcon = BrushCleaningIcon;
}
