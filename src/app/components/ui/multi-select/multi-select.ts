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


  @Input() placeholder = '';
  @Input() multi = false;
  @Input() selected: any = null;
  @Input() selectedList: any[] | undefined = [];
  @Output() selectedChange = new EventEmitter<any>();
  @Output() selectedListChange = new EventEmitter<any[]>();
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
    const values = this.getSelectedValues();
    this.entries.forEach(entry => {
      entry.selected = values.includes(entry.value);
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

  private getSelectedValues(): any[] {
    if (this.multi)
      return this.selectedList ?? [];
    return this.selected == null ? [] : [this.selected];
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
    if (this.multi) {
      const list = [...(this.selectedList ?? [])];
      const index = list.indexOf(value);

      if (index >= 0) {
        list.splice(index, 1);
        console.log("ui: multi-select: disabled option " + value)
        this.onRemoved.emit(value);
      } else {
        list.push(value);
        console.log("ui: multi-select: enabled option " + value)
        this.onAdded.emit(value);
      }
      this.selectedList = list;
      this.selectedListChange.emit(list);
    } else {
      if (this.selected === value) {
        console.log("ui: multi-select: disabled option " + value)
        this.onRemoved.emit(value);
        this.selected = null;
      } else {
        if (this.selected != null) {
          console.log("ui: multi-select: disabled option " + this.selected)
          this.onRemoved.emit(this.selected);
        }
        console.log("ui: multi-select: enabled option " + value)
        this.onAdded.emit(value);
        this.selected = value;
      }
      this.selectedChange.emit(this.selected);
      this.showOptions = false;
    }
    this.update();
  }


  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly ChevronUpIcon = ChevronUpIcon;

}
