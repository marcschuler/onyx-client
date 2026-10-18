import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelect } from './multi-select';

describe('MultiSelect', () => {
  let component: MultiSelect;
  let fixture: ComponentFixture<MultiSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a single entry on selectedChange when multi is false', () => {
    component.multi = false;
    const emitted: any[] = [];
    component.selectedChange.subscribe(value => emitted.push(value));

    component['onItemClicked']('voice');

    expect(component.selected).toBe('voice');
    expect(component.selectedList).toEqual([]);
    expect(emitted).toEqual(['voice']);
  });

  it('should deselect on a second click when multi is false', () => {
    component.multi = false;
    const removed: any[] = [];
    component.onRemoved.subscribe(value => removed.push(value));

    component['onItemClicked']('voice');
    component['onItemClicked']('voice');

    expect(component.selected).toBeNull();
    expect(removed).toEqual(['voice']);
  });

  it('should replace the previous entry when another option is picked and multi is false', () => {
    component.multi = false;
    component['onItemClicked']('voice');
    component['onItemClicked']('chat');

    expect(component.selected).toBe('chat');
    expect(component.selectedList).toEqual([]);
  });

  it('should emit multiple entries on selectedListChange when multi is true', () => {
    component.multi = true;
    component.selectedList = [];
    const emitted: any[][] = [];
    component.selectedListChange.subscribe(value => emitted.push(value));

    component['onItemClicked']('voice');
    component['onItemClicked']('chat');

    expect(component.selectedList).toEqual(['voice', 'chat']);
    expect(component.selected).toBeNull();
    expect(emitted).toEqual([['voice'], ['voice', 'chat']]);
  });

  it('should remove an entry from selectedList when it is picked again and multi is true', () => {
    component.multi = true;
    component.selectedList = ['voice'];
    const removed: any[] = [];
    component.onRemoved.subscribe(value => removed.push(value));

    component['onItemClicked']('voice');

    expect(component.selectedList).toEqual([]);
    expect(component.selected).toBeNull();
    expect(removed).toEqual(['voice']);
  });
});
