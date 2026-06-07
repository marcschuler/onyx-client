import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Tooltip as TooltipComponent} from '../components/ui/tooltip/tooltip';

@Directive({
  selector: '[appTooltip]',
})
export class Tooltip implements OnDestroy {
  private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);


  @Input('appTooltip') text!:string;
  private overlayRef?: OverlayRef;

  @HostListener('mouseenter')
  show() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -8
        }
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });

    const tooltipPortal = new ComponentPortal(TooltipComponent);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.text = this.text;
  }

  @HostListener('mouseleave')
  hide() {
    this.overlayRef?.dispose();
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}
