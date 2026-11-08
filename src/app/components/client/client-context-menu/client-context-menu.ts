import {Component, inject, Input} from '@angular/core';
import {ContextMenu} from '../../ui/context/context-menu/context-menu';
import {ContextMenuButton} from '../../ui/context/context-menu-button/context-menu-button';
import {Client, WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {
  LucideCircle,
  LucideCircleSlash2,
  LucideCopy,
  LucideHexagon,
  LucideKeyRound,
  LucideLogIn,
  LucideUser,
  LucideUserX
} from '@lucide/angular';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {RestService} from '../../../services/rest/rest-service';
import {ProfileImage} from '../profile-image/profile-image';
import {SlicePipe} from '@angular/common';
import {ContextMenuService, POPUP_CONTEXT} from '../../../services/ui/context-menu-service';
import {ClientAbout} from '../client-about/client-about';
import {ChannelDTO, ClientChannelJoinRequest, UserSimpleDTO} from '../../../../api/onyx-server';
import {WebSocketService} from '../../../services/websocket/web-socket-service';

@Component({
  selector: 'app-client-context-menu',
  imports: [
    ContextMenu,
    ContextMenuButton,
    ProfileImage,
    SlicePipe,
    LucideHexagon,
    LucideKeyRound,
    LucideCopy,
    LucideLogIn,
    LucideCircle,
  ],
  templateUrl: './client-context-menu.html',
  styleUrl: './client-context-menu.css',
})
export class ClientContextMenu {
  @Input() user!: UserSimpleDTO;
  @Input() connection!: WebSocketServerConnection;

  private toastService = inject(ToastService);
  private restService = inject(RestService);
  private contextMenuService = inject(ContextMenuService);
  private webSocketService = inject(WebSocketService);
  private popup = inject(POPUP_CONTEXT);

  /** the online client of this user, undefined if the user is offline */
  protected get client(): Client | undefined {
    return this.connection.client(this.user.id);
  }

  protected get isSelf() {
    return this.user.id === this.connection.identity.id;
  }

  protected get labelGroups() {
    return this.user.groups.filter(g => g.label);
  }

  protected get clientChannel(): ChannelDTO | undefined {
    const channelId = this.client?.channel;
    return channelId ? this.connection.channel(channelId) : undefined;
  }

  protected canJoin(channel: ChannelDTO) {
    return channel.voiceMode !== ChannelDTO.VoiceModeEnum.None;
  }

  protected joinChannel(channel: ChannelDTO) {
    this.webSocketService.send(this.connection, {
      channelId: channel.id,
      type: ClientChannelJoinRequest.TypeEnum.ClientChannelJoinRequest
    } as ClientChannelJoinRequest);
    this.popup.close();
  }

  protected kickClientFromChannel() {
    this.connection.rest.userController.kickFromChannel(this.user.id, {})
      .subscribe(() => {
        this.toastService.create({
          type: ToastType.Success,
          title: "Client '" + this.user.username + "' kicked"
        });
      }, error => this.restService.handleError(error));
  }

  protected kickClientFromServer() {
    this.connection.rest.userController.kickFromServer(this.user.id, {})
      .subscribe(() => {
        this.toastService.create({
          type: ToastType.Success,
          title: "Client '" + this.user.username + "' kicked"
        });
      }, error => this.restService.handleError(error));
  }

  protected openAboutPage() {
    this.contextMenuService.openPopup(ClientAbout, {
      user: this.user,
      connection: this.connection
    })
  }


  protected readonly LucideCircleSlash2 = LucideCircleSlash2;
  protected readonly LucideUser = LucideUser;
  protected readonly LucideUserX = LucideUserX;
}
