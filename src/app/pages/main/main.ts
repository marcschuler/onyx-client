import { Component } from '@angular/core';
import {ServerSelector} from './server-selector/server-selector';

@Component({
  selector: 'app-main',
  imports: [
    ServerSelector
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {

}
