import { Component, inject } from '@angular/core';
import {ToastMessage, ToastService} from '../../../services/ui/toast-service';
import {NgClass} from '@angular/common';
import {LucideAngularModule, XIcon} from 'lucide-angular';

@Component({
  selector: 'app-toast',
  imports: [
    NgClass,
    LucideAngularModule
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  protected toastService = inject(ToastService);

  dismiss(toast: ToastMessage) { this.toastService.dismiss(toast); }

  protected readonly XIcon = XIcon;
}
