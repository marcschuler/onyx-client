import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed, effect, input,
  Input, output,
  viewChild,
  viewChildren
} from '@angular/core';
import {Combobox, ComboboxInput, ComboboxPopupContainer} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {CdkConnectedOverlay} from '@angular/cdk/overlay';
import {CdkListboxModule} from '@angular/cdk/listbox';
import {ChevronDownIcon, LucideAngularModule, LucideIconData} from 'lucide-angular';

@Component({
  selector: 'ui-multi-select',
  imports: [
    Combobox,
    CdkConnectedOverlay,
    ComboboxPopupContainer,
    ComboboxInput,
    Listbox,
    CdkListboxModule,
    Option,
    LucideAngularModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
})
export class MultiSelect<T> {

  @Input() labelEmpty: string = 'Select';
  @Input() multi: boolean = true;

  @Input() option!: SelectOptionOrString<T>[] | string[];

  selected = input<T[]|T>([]);
  selectedChange = output<T[]|T>();

  listbox = viewChild<Listbox<SelectOptionOrString<T>>>(Listbox);
  options = viewChildren<Option<SelectOptionOrString<T>>>(Option);
  combobox = viewChild<Combobox<string>>(Combobox);

  displayIcon = computed(() => {
    const values = this.listbox()?.values() || [];
    return undefined
  });

  /** The string that is displayed in the combobox. */
  displayValue = computed(() => {
    const values = this.listbox()?.values() || [];
    if (values.length === 0) {
      return this.labelEmpty;
    }
    if (values.length === 1) {
      return values[0];
    }
    return `${values[0]} + ${values.length - 1} more`;
  });

  constructor() {
    // Scrolls to the active item when the active option changes.
    // The slight delay here is to ensure animations are done before scrolling.
    afterRenderEffect(() => {
      const option = this.options().find((opt) => opt.active());
      setTimeout(() => option?.element.scrollIntoView({block: 'nearest'}), 50);
    });

    // Resets the listbox scroll position when the combobox is closed.
    afterRenderEffect(() => {
      if (!this.combobox()?.expanded()) {
        setTimeout(() => this.listbox()?.element.scrollTo(0, 0), 150);
      }
    });
  }


  protected readonly ChevronDownIcon = ChevronDownIcon;



  protected getId(option: SelectOptionOrString<T>) {
    return (option as any).id ? (option as SelectOption<T>).id : option;
  }

  protected getLabel(option: SelectOptionOrString<T>): string {
    return (option as any).id ? (option as SelectOption<T>).label : (option as string);
  }
}


export interface SelectOption<T> {
  id: T
  label: string;
  icon: LucideIconData | undefined;
}

type SelectOptionOrString<T> = SelectOption<T> | string;
