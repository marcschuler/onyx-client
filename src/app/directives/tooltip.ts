import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Tooltip as TooltipComponent} from '../components/ui/tooltip/tooltip';

@Directive({
  selector: '[appTooltip]',
})
export class Tooltip {

  @Input('appTooltip') text!:string;
  private overlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef
  ) {}

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
