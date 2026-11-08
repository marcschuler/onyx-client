import {booleanAttribute, Component, EventEmitter, Input, Output} from '@angular/core';
import {CdkMenuItem} from '@angular/cdk/menu';
import {LucideDynamicIcon, LucideIcon} from '@lucide/angular';

@Component({
  selector: 'app-context-menu-button',
  imports: [
    CdkMenuItem,
    LucideDynamicIcon,
  ],
  templateUrl: './context-menu-button.html',
  styleUrl: './context-menu-button.css',
})
export class ContextMenuButton {

  @Input() icon: LucideIcon | undefined;
  @Input({transform: booleanAttribute}) danger = false; // red, for destructive actions (kick, ban)

  @Output() click: EventEmitter<PointerEvent> = new EventEmitter();
  @Input() disabled!: boolean;

  protected onClick($event: PointerEvent) {
    this.click.emit($event);
  }
}
