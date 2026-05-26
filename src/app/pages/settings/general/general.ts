import { Component } from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {FormsModule} from '@angular/forms';
import {Toggle} from '../../../components/ui/toggle/toggle';

@Component({
  selector: 'app-general',
  imports: [
    FormsModule,
    Toggle
  ],
  templateUrl: './general.html',
  styleUrl: './general.css',
})
export class General {

  constructor(protected interfaceService: StorageService) {}

}
