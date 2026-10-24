import { Component, inject } from '@angular/core';
import {ToastMessage, ToastService} from '../../../services/ui/toast-service';
import {NgClass} from '@angular/common';
import {LucideX} from '@lucide/angular';

@Component({
  selector: 'app-toast',
  imports: [
    NgClass,
    LucideX
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  protected toastService = inject(ToastService);

  dismiss(toast: ToastMessage) { this.toastService.dismiss(toast); }
}
