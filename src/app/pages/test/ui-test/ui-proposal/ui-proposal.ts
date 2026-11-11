import {afterNextRender, Component, ElementRef, signal, viewChild} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  LucideCalendar,
  LucideCircleCheck,
  LucideCircleSlash,
  LucideGamepadDirectional,
  LucideGhost,
  LucideHexagon,
  LucideKeyRound,
  LucideMessageSquareReply,
  LucidePlus,
  LucideSave,
  LucideServer,
  LucideSettings,
  LucideTicketSlash,
  LucideTrash2,
  LucideTriangleAlert,
  LucideUserCheck,
  LucideUserPlus,
} from '@lucide/angular';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {Toggle} from '../../../../components/ui/toggle/toggle';
import {ToggleButton} from '../../../../components/ui/toggle-button/toggle-button';
import {MultiSelect} from '../../../../components/ui/multi-select/multi-select';
import {SelectItem} from '../../../../components/ui/multi-select/select-item/select-item';

/**
 * Second half of /test/ui: the classes proposed in ui-proposal.css, applied to rebuilt
 * versions of the elements from the first half. The stylesheet only applies to this component.
 */
@Component({
  selector: 'app-ui-proposal',
  imports: [
    AsyncPipe,
    FormsModule,
    IdenticonPipe,
    Toggle,
    ToggleButton,
    MultiSelect,
    SelectItem,
    LucideCalendar,
    LucideCircleCheck,
    LucideCircleSlash,
    LucideGamepadDirectional,
    LucideGhost,
    LucideHexagon,
    LucideKeyRound,
    LucideMessageSquareReply,
    LucidePlus,
    LucideSave,
    LucideServer,
    LucideSettings,
    LucideTicketSlash,
    LucideTrash2,
    LucideTriangleAlert,
    LucideUserCheck,
    LucideUserPlus,
  ],
  host: {
    '(window:resize)': 'measureContainer()',
  },
  templateUrl: './ui-proposal.html',
  styleUrls: ['../ui-test.css', './ui-proposal.css'],
})
export class UiProposal {
  private containerProbe = viewChild.required<ElementRef<HTMLElement>>('containerProbe');

  // computed style of a .container element, shows the max-width added by Tailwind's container utility
  protected readonly containerMaxWidth = signal('');
  protected readonly windowWidth = signal(0);

  protected readonly buttonVariants: ProposedButton[] = [
    {cls: '', label: 'button (no class)', usage: 'Most buttons. Replaces .button-dark outside of navigation.'},
    {cls: 'button-primary', label: '.button-primary', usage: 'The one main action of a view: Save, Create, Connect, Join.'},
    {cls: 'button-outline', label: '.button-outline', usage: 'Secondary action on a card or panel. Replaces .button-line, .button-border-onyx.'},
    {cls: 'button-quiet', label: '.button-quiet', usage: 'Toolbars, icon buttons, navigation. Replaces .button-text, .button-simpletext-onyx, .button-dark in split panels.'},
    {cls: 'button-danger', label: '.button-danger', usage: 'Destructive actions, red on hover. Replaces .button-red, .button-text-red, .button-border-red and the identity delete button.'},
    {cls: 'button-dashed', label: '.button-dashed', usage: '"Add" placeholders: + Channel, + Section. Replaces .button-ghost.'},
  ];

  protected readonly navEntries = ['General', 'Identities', 'Game Integration'];
  protected selectedNavEntry = 'Identities';

  protected readonly layerSnippet = `@import "tailwindcss";
@import "./style.ui.css";   /* already uses @layer components */

@layer base {
  body  { @apply bg-neutral-900 text-white; }
  label { @apply block mb-2 text-sm font-medium text-neutral-200; }
  input, textarea, select, a, ul, h1, h2, h3, h4 { /* unchanged */ }
}

@layer components {
  button, .button { /* unchanged */ }
  .button-main, .button-red, /* ... every other class of styles.css */
}`;

  // current markup -> proposed class
  protected readonly migration: MigrationEntry[] = [
    {from: '.container', to: '.card', where: 'identity editor, server editor, game integration, invite panel, intro'},
    {from: '.container-list', to: '.stack', where: 'identity list, invites, server description'},
    {from: 'flex-1 min-w-0 / flex flex-wrap items-center gap-x-4 gap-y-1', to: '.card-body / .detail-row', where: 'identity editor'},
    {from: '.item-row-right, text-right pt-4, flex justify-end', to: '.actions', where: 'invite panel, channel / section / group editor, security panel, dialog'},
    {from: '.button-main', to: '.button-primary', where: 'everywhere'},
    {from: '.button-line, .button-border-onyx', to: '.button-outline', where: 'admin panels, invite panel'},
    {from: '.button-text, .button-simpletext-onyx, .button-dark (nav)', to: '.button-quiet', where: 'chat toolbar, channel join / leave, split panel, user panel'},
    {from: '.button-red, .button-text-red, .button-border-red', to: '.button-danger', where: 'every delete / kick / ban button'},
    {from: '.button-small, .button-mini, .button-circle, p-2!', to: '.button-icon', where: 'icon-only buttons'},
    {from: '.button-ghost', to: '.button-dashed', where: '+ Channel, + Section'},
    {from: 'flex + !rounded-r-none / !rounded-l-none', to: '.input-group', where: 'invite code, connect box, create group, create invite'},
    {from: 'div > label + input, text-red-400 text-xs mt-1', to: '.field, .field-hint, .field-error', where: 'server editor, identity editor, game integration'},
    {from: '.settings-grid, .settings-grid-*', to: '.setting, .setting-label, .setting-desc', where: 'general, security, channel editor, group panel'},
    {from: '.chip-main, hand-made group and "Temporary" labels', to: '.badge, .badge-*', where: 'identity editor, user entry, context menu, message'},
    {from: 'h3.pt-8, h3.pt-4.pb-2, h6.text-xs, h4 "Idle"', to: '.section-title, .section-label', where: 'settings and admin pages, server tree'},
    {from: '.text-hint, .subtitle color, text-text-faded, text-neutral-400/500', to: '.text-muted, .text-subtle', where: 'descriptions, timestamps, hints'},
    {from: 'three hand-made empty states', to: '.empty-state', where: 'welcome, message view, invites'},
    {from: 'toast ngClass map, temporary chat banner, reply error', to: '.alert, .alert-*', where: 'toast, message view, message'},
  ];

  protected readonly unusedClasses = [
    '.button-selected', '.button-selected-border', '.button-green', '.button-no-round', '.hover-greenish',
    '.greenish', '.bg-onyx-hover', '.text-h1 … .text-h4', '.divider', '.divider-v', '.input-invisible',
    '.bg-animate', '.text-hint',
  ];

  protected readonly brokenClasses: BrokenClass[] = [
    {cls: 'rainbow-img', file: 'pages/main/welcome/welcome.html', note: 'not defined anywhere'},
    {cls: 'bg-animate-sky', file: 'components/ui/toggle/toggle.html', note: 'not defined (only .bg-animate exists)'},
    {cls: 'D', file: 'components/server/server-tree/channel/channel.html', note: 'stray character in the class list'},
    {cls: 'h-fulll', file: 'components/server/message-view/message-view.html', note: 'typo of h-full'},
    {cls: 'mx-h-screen', file: 'pages/main/server/server.html', note: 'typo of max-h-screen'},
    {cls: 'input-', file: 'pages/settings/server-user/server-user.html', note: 'unfinished class name'},
    {cls: 'hover:bg-none', file: 'styles.css (button-simpletext-onyx)', note: 'bg-none removes background-image, not the color'},
    {cls: '@utility button-border-onyx', file: 'styles.css', note: 'defined twice, the second definition wins'},
  ];

  // state of the interactive demos
  protected readonly aliceKey = 'MCowBQYDK2VwAyEAq7Jz3Wd9Lx0Rk2PfT8sVbN1cYmE4hGuQ6oAiX5eZ0Hw=';
  protected username = 'Al';
  protected useMarkdown = true;
  protected compactMode = false;
  protected voiceMode: string | null = 'FULL';

  constructor() {
    afterNextRender(() => this.measureContainer());
  }

  measureContainer() {
    this.containerMaxWidth.set(getComputedStyle(this.containerProbe().nativeElement).maxWidth);
    this.windowWidth.set(window.innerWidth);
  }
}

interface ProposedButton {
  cls: string;
  label: string;
  usage: string;
}

interface MigrationEntry {
  from: string;
  to: string;
  where: string;
}

interface BrokenClass {
  cls: string;
  file: string;
  note: string;
}
