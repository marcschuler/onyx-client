import { Component } from '@angular/core';
import {CdkMenu} from '@angular/cdk/menu';

@Component({
  selector: 'app-context-menu',
  imports: [
    CdkMenu
  ],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {

}
