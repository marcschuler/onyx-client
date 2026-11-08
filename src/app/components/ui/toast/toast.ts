import {afterRenderEffect, Component, ElementRef, inject, viewChild} from '@angular/core';
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
  private layer = viewChild.required<ElementRef<HTMLElement>>('container');

  constructor() {
    afterRenderEffect(() => {
      const toasts = this.toastService.toasts();
      const element = this.layer().nativeElement;

      if (toasts.length === 0) {
        if (element.matches(':popover-open'))
          element.hidePopover();
        return;
      }

      if (element.matches(':popover-open'))
        element.hidePopover();
      element.showPopover();
    });
  }

  dismiss(toast: ToastMessage) { this.toastService.dismiss(toast); }
}
