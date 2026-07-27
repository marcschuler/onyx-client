import {
  Component, ComponentRef,
  EventEmitter,
  inject, Injector,
  Input,
  Output, ViewChild, ViewContainerRef,
} from '@angular/core';
import {POPUP_CONTEXT} from '../../../services/ui/context-menu-service';

@Component({
  selector: 'app-popup',
  imports: [ ],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  protected popupContext = inject(POPUP_CONTEXT);

  @Output() close = new EventEmitter<void>();

  @Input() closeButton: boolean = true;
  @Input() fullHeight = false;


  @ViewChild('vc', {read: ViewContainerRef, static: true})
  vc!: ViewContainerRef;

  childRef?: ComponentRef<any>;

  attachComponent<T>(component: any, data: Partial<T> | undefined, injector: Injector) {
    this.vc.clear();

    this.childRef = this.vc.createComponent(component, {
      injector: injector
    });

    if (data && this.childRef.instance) {
      Object.assign(this.childRef.instance, data);
    }

    return this.childRef;
  }



  protected onOutOfBorder(event: MouseEvent) {
    if (event.target === event.currentTarget)
      this.popupContext.close();
  }
}

