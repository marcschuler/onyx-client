import { Component, computed, ElementRef, output, signal, viewChild } from '@angular/core';
import type { CompactEmoji } from 'emojibase';

export interface EmojiCategory {
  id: number;
  key: string;
  label: string;
  icon: string;
  emojis: CompactEmoji[];
}

// emojibase group ids (see emojibase-data/meta/groups.json). Group 2 ("component")
// only contains skin tone / hair modifiers and is intentionally left out.
const CATEGORY_META: { id: number; key: string; label: string; icon: string }[] = [
  { id: 0, key: 'smileys-emotion', label: 'Smileys & Emotion', icon: '😀' },
  { id: 1, key: 'people-body', label: 'People & Body', icon: '👋' },
  { id: 3, key: 'animals-nature', label: 'Animals & Nature', icon: '🐻' },
  { id: 4, key: 'food-drink', label: 'Food & Drink', icon: '🍔' },
  { id: 5, key: 'travel-places', label: 'Travel & Places', icon: '🚗' },
  { id: 6, key: 'activities', label: 'Activities', icon: '⚽' },
  { id: 7, key: 'objects', label: 'Objects', icon: '💡' },
  { id: 8, key: 'symbols', label: 'Symbols', icon: '❤️' },
  { id: 9, key: 'flags', label: 'Flags', icon: '🏳️' },
];

// Loaded once and shared by all picker instances; the JSON is lazy-loaded
// so it does not end up in the main bundle.
let categoriesPromise: Promise<EmojiCategory[]> | null = null;

function loadCategories(): Promise<EmojiCategory[]> {
  categoriesPromise ??= import('emojibase-data/en/compact.json').then((module) => {
    const data: CompactEmoji[] = module.default;
    const byGroup = new Map<number, CompactEmoji[]>();
    for (const emoji of data) {
      if (emoji.group === undefined) continue; // regional indicator letters
      let list = byGroup.get(emoji.group);
      if (!list) byGroup.set(emoji.group, (list = []));
      list.push(emoji);
    }
    return CATEGORY_META.map((meta) => ({
      ...meta,
      emojis: (byGroup.get(meta.id) ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));
  });
  return categoriesPromise;
}

@Component({
  selector: 'app-emoji-picker',
  imports: [],
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.css',
})
export class EmojiPicker {
  readonly emojiSelected = output<string>();

  protected readonly categories = signal<EmojiCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly activeCategory = signal(CATEGORY_META[0].key);
  protected readonly hovered = signal<CompactEmoji | null>(null);

  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly visibleCategories = computed(() => {
    const term = this.search().trim().toLowerCase();
    const categories = this.categories();
    if (!term) return categories;
    return categories
      .map((category) => ({
        ...category,
        emojis: category.emojis.filter(
          (e) =>
            e.label.toLowerCase().includes(term) ||
            e.tags?.some((tag) => tag.toLowerCase().includes(term)),
        ),
      }))
      .filter((category) => category.emojis.length > 0);
  });

  constructor() {
    loadCategories().then((categories) => {
      this.categories.set(categories);
      this.loading.set(false);
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.scrollContainer()?.nativeElement.scrollTo({ top: 0 });
  }

  protected select(emoji: CompactEmoji): void {
    this.emojiSelected.emit(emoji.unicode);
  }

  protected scrollToCategory(key: string): void {
    const container = this.scrollContainer()?.nativeElement;
    const section = container?.querySelector<HTMLElement>(`[data-category="${key}"]`);
    if (!container || !section) return;
    this.activeCategory.set(key);
    // container is position:relative, so offsetTop is relative to it
    container.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
  }

  protected onScroll(): void {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLElement>('[data-category]');
    const top = container.scrollTop + 8;
    let current = sections[0]?.dataset['category'];
    for (const section of Array.from(sections)) {
      if (section.offsetTop <= top) current = section.dataset['category'];
      else break;
    }
    if (current) this.activeCategory.set(current);
  }
}
