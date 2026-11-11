import {Component, inject} from '@angular/core';
import {AsyncPipe, SlicePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER} from '@angular/cdk/menu';
import {
  LucideBug,
  LucideCalendar,
  LucideCalendarChevronsRight,
  LucideCalendarClock,
  LucideChevronDown,
  LucideCircleSlash,
  LucideCircleSlash2,
  LucideCornerDownRight,
  LucideEllipsis,
  LucideEye,
  LucideFileUp,
  LucideFingerprintPattern,
  LucideGamepadDirectional,
  LucideGhost,
  LucideHeadphones,
  LucideHexagon,
  LucideKeyRound,
  LucideLockKeyhole,
  LucideLogIn,
  LucideLogOut,
  LucideMessageSquareReply,
  LucideMessageSquareText,
  LucideMic,
  LucideSave,
  LucideScreenShareOff,
  LucideSend,
  LucideServer,
  LucideServerOff,
  LucideSettings,
  LucideTicketSlash,
  LucideTrash2,
  LucideUserX,
  LucideVideoOff,
  LucideX,
} from '@lucide/angular';
import {UserSimpleDTO} from '../../../../api/onyx-server';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {Toggle} from '../../../components/ui/toggle/toggle';
import {ToggleButton} from '../../../components/ui/toggle-button/toggle-button';
import {Chip} from '../../../components/ui/chip/chip';
import {MultiSelect} from '../../../components/ui/multi-select/multi-select';
import {SelectItem} from '../../../components/ui/multi-select/select-item/select-item';
import {Spinner} from '../../../components/ui/spinner/spinner';
import {KeyVisualizer} from '../../../components/ui/key-visualizer/key-visualizer';
import {ContextMenu} from '../../../components/ui/context/context-menu/context-menu';
import {ContextMenuButton} from '../../../components/ui/context/context-menu-button/context-menu-button';
import {SplitPanel} from '../../../components/ui/split-panel/split-panel';
import {SplitPanelBar} from '../../../components/ui/split-panel/split-panel-bar/split-panel-bar';
import {SplitPanelButton} from '../../../components/ui/split-panel/split-panel-button/split-panel-button';
import {SplitPanelDivider} from '../../../components/ui/split-panel/split-panel-divider/split-panel-divider';
import {ProfileImage} from '../../../components/client/profile-image/profile-image';
import {SplitPanelSelector} from '../../../directives/split-panel-selector';
import {Tooltip} from '../../../directives/tooltip';
import {BUTTON_CANCEL, BUTTON_DELETE} from '../../../components/ui/dialog/dialog';
import {ContextMenuService} from '../../../services/ui/context-menu-service';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {UiProposal} from './ui-proposal/ui-proposal';
import {WelcomeMockup} from './welcome-mockup/welcome-mockup';

/**
 * Developer page (/test/ui) that shows the common UI elements of the client with mock data.
 * Pure UI components are used as they are; components that need a server connection
 * are copied as markup (the source file is noted above each copy).
 * The second half of the page (UiProposal) shows proposed shared CSS classes.
 */
@Component({
  selector: 'app-ui-test',
  imports: [
    AsyncPipe,
    SlicePipe,
    FormsModule,
    IdenticonPipe,
    Toggle,
    ToggleButton,
    Chip,
    MultiSelect,
    SelectItem,
    Spinner,
    KeyVisualizer,
    ContextMenu,
    ContextMenuButton,
    SplitPanel,
    SplitPanelBar,
    SplitPanelButton,
    SplitPanelDivider,
    SplitPanelSelector,
    ProfileImage,
    Tooltip,
    UiProposal,
    WelcomeMockup,
    LucideCalendar,
    LucideCalendarChevronsRight,
    LucideCalendarClock,
    LucideChevronDown,
    LucideCircleSlash,
    LucideEllipsis,
    LucideEye,
    LucideFileUp,
    LucideGamepadDirectional,
    LucideGhost,
    LucideHeadphones,
    LucideHexagon,
    LucideKeyRound,
    LucideLockKeyhole,
    LucideLogIn,
    LucideLogOut,
    LucideMessageSquareReply,
    LucideMessageSquareText,
    LucideMic,
    LucideSave,
    LucideScreenShareOff,
    LucideSend,
    LucideServer,
    LucideServerOff,
    LucideTicketSlash,
    LucideTrash2,
    LucideVideoOff,
    LucideX,
  ],
  providers: [
    // context menu buttons need a menu stack. In the app it comes from the overlay injector of ContextMenuService
    PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
  ],
  templateUrl: './ui-test.html',
  styleUrl: './ui-test.css',
})
export class UiTest {
  private toastService = inject(ToastService);
  private contextMenuService = inject(ContextMenuService);

  protected readonly sections: TocEntry[] = [
    {id: 'typography', title: 'Typography & text'},
    {id: 'containers', title: 'Containers'},
    {id: 'details', title: 'Details, chips & avatars'},
    {id: 'buttons', title: 'Buttons'},
    {id: 'inputs', title: 'Inputs & controls'},
    {id: 'settings-grid', title: 'Settings grid'},
    {id: 'lists', title: 'Lists & dividers'},
    {id: 'sidebar', title: 'Sidebar entries'},
    {id: 'chat', title: 'Chat'},
    {id: 'overlays', title: 'Menus, dialogs & toasts'},
    {id: 'feedback', title: 'Loading & empty states'},
    {id: 'split-panel', title: 'Split panel'},
  ];

  protected readonly mockupSections: TocEntry[] = [
    {id: 'welcome-mockup', title: 'Welcome page'},
  ];

  protected readonly proposalSections: TocEntry[] = [
    {id: 'proposal-foundation', title: 'Fix first'},
    {id: 'proposal-card', title: 'Card & layout'},
    {id: 'proposal-buttons', title: 'Buttons'},
    {id: 'proposal-form', title: 'Form fields'},
    {id: 'proposal-settings', title: 'Settings rows'},
    {id: 'proposal-badges', title: 'Badges'},
    {id: 'proposal-text', title: 'Text'},
    {id: 'proposal-feedback', title: 'Empty states & alerts'},
    {id: 'proposal-migration', title: 'Migration map'},
  ];

  // every button class from styles.css; "unused" = not referenced by any template
  protected readonly buttonVariants: ButtonVariant[] = [
    {label: 'button (no class)', cls: '', usage: 'base style of every <button>'},
    {label: '.button-main', cls: 'button-main', usage: 'primary action: Save, Create, Join'},
    {label: '.button-dark', cls: 'button-dark', usage: 'split panel entries, Cancel, connect'},
    {label: '.button-dark.button-dark-selected', cls: 'button-dark button-dark-selected', usage: 'selected split panel entry'},
    {label: '.button-line', cls: 'button-line', usage: 'Save in channel / section / group editor'},
    {label: '.button-red', cls: 'button-red', usage: 'Delete next to Save'},
    {label: '.button-border-onyx', cls: 'button-border-onyx', usage: 'invite save (the utility is defined twice)'},
    {label: '.button-border-red', cls: 'button-border-red', usage: 'invite delete'},
    {label: '.button-text', cls: 'button-text', usage: 'Add Markdown text'},
    {label: '.button-text-red', cls: 'button-text-red', usage: 'delete server description'},
    {label: '.button-simpletext-onyx', cls: 'button-simpletext-onyx', usage: 'chat toolbar, join / leave channel'},
    {label: '.button-ghost', cls: 'button-ghost', usage: '+ Channel, + Section'},
    {label: '.button-onyx', cls: 'button-onyx', usage: 'server entry on the welcome page'},
    {label: '.button-light', cls: 'button-light', usage: 'dialog close button'},
    {label: '.button-selected', cls: 'button-selected', usage: '', unused: true},
    {label: '.button-selected-border', cls: 'button-selected-border', usage: '', unused: true},
    {label: '.button-green', cls: 'button-green', usage: '', unused: true},
    {label: '.button-no-round', cls: 'button-no-round', usage: '', unused: true},
  ];

  // fake public keys, only used to render identicons
  protected readonly keys = {
    alice: 'MCowBQYDK2VwAyEAq7Jz3Wd9Lx0Rk2PfT8sVbN1cYmE4hGuQ6oAiX5eZ0Hw=',
    bob: 'MCowBQYDK2VwAyEAb4Ty8Kp1Qs6Vn3Hc9Lm2Xr7Fd5Gj0Wz4Ea8Ui1Oy6Bv=',
    carol: 'MCowBQYDK2VwAyEAc9Rw2Mn5Lk8Jh1Gf4Ds7Az0Xc3Vb6Nm9Qp2We5Rt8Yu=',
    dave: 'MCowBQYDK2VwAyEAd1Ab3Cd5Ef7Gh9Ij2Kl4Mn6Op8Qr0St1Uv3Wx5Yz7Ab=',
  };

  protected readonly users: MockUser[] = [
    {id: this.keys.alice, publicKey: {}, username: 'Alice', groups: [], labels: ['Admin']},
    {id: this.keys.bob, publicKey: {}, username: 'Bob', groups: [], labels: [], game: 'Factorio'},
    {id: this.keys.carol, publicKey: {}, username: 'Carol', groups: [], labels: ['Mod']},
    {id: this.keys.dave, publicKey: {}, username: 'Dave', groups: [], labels: []},
  ];

  protected readonly mockSections: MockSection[] = [
    {
      name: 'General', channels: [
        {name: 'Lobby', current: true, selected: false, users: [this.users[0], this.users[1]]},
        {name: 'Gaming', current: false, selected: true, users: [this.users[2]]},
      ]
    },
    {
      name: 'Off topic', channels: [
        {name: 'Music', current: false, selected: false, users: []},
      ]
    },
  ];

  protected readonly permissionOptions = ['CHANNEL_JOIN', 'CHANNEL_CREATE', 'MESSAGE_SEND', 'MESSAGE_DELETE', 'USER_KICK'];

  // state of the interactive demos
  protected identityName = 'Alice';
  protected compactMode = false;
  protected legacyChat = true;
  protected sidebarCompact = false;
  protected useMarkdown = true;
  protected voiceMode: string | null = 'FULL';
  protected permissions: string[] = ['CHANNEL_JOIN', 'MESSAGE_SEND'];

  protected readonly ToastType = ToastType;
  protected readonly LucideSettings = LucideSettings;
  protected readonly LucideFingerprintPattern = LucideFingerprintPattern;
  protected readonly LucideHexagon = LucideHexagon;
  protected readonly LucideBug = LucideBug;
  protected readonly LucideCornerDownRight = LucideCornerDownRight;
  protected readonly LucideX = LucideX;
  protected readonly LucideCircleSlash2 = LucideCircleSlash2;
  protected readonly LucideUserX = LucideUserX;

  protected scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  protected toast(type: ToastType) {
    this.toastService.create({
      type: type,
      title: 'A ' + type + ' toast',
      message: 'Toasts are rendered by app-toast in app.html',
    });
  }

  protected openDialog() {
    this.contextMenuService.openDialog({
      title: 'Delete identity?',
      content: 'Servers will no longer recognize you with this identity. This can not be undone.',
      buttons: [BUTTON_CANCEL, BUTTON_DELETE],
    });
  }
}

interface TocEntry {
  id: string;
  title: string;
}

interface ButtonVariant {
  label: string;
  cls: string;
  usage: string;
  unused?: boolean;
}

interface MockUser extends UserSimpleDTO {
  labels: string[];
  game?: string;
}

interface MockSection {
  name: string;
  channels: {
    name: string;
    current: boolean; // the channel the user is in
    selected: boolean; // the channel shown in the main view
    users: MockUser[];
  }[];
}
