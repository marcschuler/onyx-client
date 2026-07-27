import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CdkMenuItem} from '@angular/cdk/menu';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-context-menu-button',
  imports: [
    CdkMenuItem,
    LucideAngularModule,
  ],
  templateUrl: './context-menu-button.html',
  styleUrl: './context-menu-button.css',
})
export class ContextMenuButton {

  @Input() icon: any | undefined;
  @Input() subMenu: boolean = false;

  @Output() click: EventEmitter<PointerEvent> = new EventEmitter();
  @Input() disabled!: boolean;

  protected onClick($event: PointerEvent) {
    this.click.emit($event);
  }
}
