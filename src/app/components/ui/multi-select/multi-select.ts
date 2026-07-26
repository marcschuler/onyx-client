import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  QueryList,
  ContentChildren,
  AfterContentInit,
  HostListener,
  ElementRef,
  inject, ChangeDetectorRef
} from '@angular/core';
import {CdkListboxModule} from '@angular/cdk/listbox';
import {ChevronDownIcon, ChevronUpIcon, LucideAngularModule} from 'lucide-angular';
import {SelectItem} from './select-item/select-item';

@Component({
  selector: 'ui-multi-select',
  imports: [
    CdkListboxModule,
    LucideAngularModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
})
export class MultiSelect implements AfterViewInit, OnChanges, AfterContentInit {
  private el = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);


  @Input() placeholder = 'Select';
  @Input() multi = true;
  @Input() selected: any[] | any = [];
  @Output() selectedChange = new EventEmitter<any[] | any>();
  @Output() onAdded = new EventEmitter<any>();
  @Output() onRemoved = new EventEmitter<any>();

  @ContentChildren(SelectItem) entries!: QueryList<SelectItem>;

  showOptions = false;
  label: string = this.placeholder;
  placeholderActive = false;

  ngAfterViewInit(): void {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges<any>): void {
    this.update();
  }

  ngAfterContentInit(): void {
    this.bindEntries();

    this.entries.changes.subscribe(() => {
      this.bindEntries();
    });
  }


  update() {
    if (!this.entries)
      return;
    this.entries.forEach(entry => {
      entry.selected = (this.selected.includes(entry.value));
    })

    this.label = this.entries.filter(entry => entry.selected)
      .map(e => e.label)
      .join(", ");
    if (this.label == "") {
      this.label = this.placeholder;
      this.placeholderActive = true;
    } else {
      this.placeholderActive = false;
    }
    //i don't know why but without the explicit call the component only visibly updates for first draw when a user clicks on the ui
    this.cdr.markForCheck();
  }

  private bindEntries(): void {
    this.entries.forEach(entry => {
      entry.clicked.subscribe(value => {
        this.onItemClicked(value);
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    const clickedInside = this.el.nativeElement.contains(target);

    if (!clickedInside) {
      this.showOptions = false;
    }
  }

  private onItemClicked(value: string): void {
    const index = this.selected.indexOf(value);

    if (index >= 0) {
      this.selected.splice(index, 1);
      console.log("ui: multi-select: disabled option " + value)
      this.onRemoved.emit(value);
    } else {
      this.selected.push(value);
      console.log("ui: multi-select: enabled option " + value)
      this.onAdded.emit(value);
    }
    if (!this.multi) {
      this.showOptions = false;
    }
    this.update();
  }


  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly ChevronUpIcon = ChevronUpIcon;

}
