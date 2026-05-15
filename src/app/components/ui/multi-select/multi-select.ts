import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  QueryList, ContentChildren, AfterContentInit, HostListener, ElementRef,
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

  @Input() placeholder: string = 'Select';
  @Input() multi: boolean = true;
  @Input() selected: any[] | any = [];
  @Output() selectedChange = new EventEmitter<any[] | any>();

  @ContentChildren(SelectItem) entries!: QueryList<SelectItem>;

  showOptions: boolean = false;
  label: string = this.placeholder;
  placeholderActive: boolean = false;


  constructor(private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.update();
    },100);
  }

  ngOnChanges(changes: SimpleChanges<any>): void {
    setTimeout(() => {
      this.update();
    });
  }

  ngAfterContentInit(): void {
    this.bindEntries();

    this.entries.changes.subscribe(() => {
      this.bindEntries();
    });
  }


  update() {
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
    console.log(value);

    const index = this.selected.indexOf(value);

    if (index >= 0) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(value);
    }
    if (!this.multi) {
      this.showOptions = false;
    }
    this.update();
  }


  protected readonly ChevronDownIcon = ChevronDownIcon;
  protected readonly ChevronUpIcon = ChevronUpIcon;

}
