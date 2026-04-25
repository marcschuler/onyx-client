import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: ToastMessage[] = [];

  create(toast: ToastMessage) {
    this.toasts.push(toast);
    setTimeout(() => {
      this.dismiss(toast)
    }, toast.duration || 30000)
  }

  dismiss(toast: ToastMessage) {
    this.toasts.splice(
      this.toasts.indexOf(toast),
      1
    )
  }

  createNetworkError(){

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
