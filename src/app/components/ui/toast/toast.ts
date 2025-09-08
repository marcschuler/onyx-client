import { Component } from '@angular/core';
import {ToastMessage, ToastService} from '../../../services/toast-service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [
    NgClass
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {

  constructor(protected toastService: ToastService) {}
  dismiss(toast: ToastMessage) { this.toastService.dismiss(toast); }

}
