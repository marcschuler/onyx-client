import {Component, Input} from '@angular/core';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {AsyncPipe} from '@angular/common';
import {IdenticonPipe} from '../../../pipes/identicon-pipe';
import {PreviewImage} from '../../ui/preview-image/preview-image';
import {UserExtendedDTO, UserSimpleDTO} from '../../../../api/onyx-server';

@Component({
  selector: 'app-profile-image',
  imports: [
    AsyncPipe,
    IdenticonPipe,
    PreviewImage
  ],
  templateUrl: './profile-image.html',
  styleUrl: './profile-image.css',
  host: {
    class: 'inline-block shrink-0 aspect-square overflow-hidden rounded-full',
    '[style.width.px]': 'sizePx',
    '[style.height.px]': 'sizePx',
  }
})
export class ProfileImage {

  @Input() user!: UserSimpleDTO | UserExtendedDTO;
  @Input() connection!: WebSocketServerConnection;
  @Input() size = 8;

  get sizePx(): number {
    return this.size * 4;
  }

}
