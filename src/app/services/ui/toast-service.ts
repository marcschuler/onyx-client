import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  readonly toasts = signal<ToastMessage[]>([]);

  create(toast: ToastMessage) {
    this.toasts.update(toasts => [...toasts, toast]);
    setTimeout(() => {
      this.dismiss(toast)
    }, toast.duration || 5000)
  }

  dismiss(toast: ToastMessage) {
    this.toasts.update(toasts => toasts.filter(current => current !== toast));
  }
}

export interface ToastMessage {
  title?: string;
  message?: string;
  duration?: number;
  type: ToastType;
}

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = "info",
  Warning = "warning",
}
