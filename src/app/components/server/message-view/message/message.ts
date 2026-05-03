import {Component, Input} from '@angular/core';
import {FileMessageContentDTO, MarkdownMessageContentDTO, MessageDTO} from "../../../../../api/webrtc-server";
import {AsyncPipe, NgClass} from '@angular/common';
import {WebSocketServerConnection} from '../../../../services/websocket/WebSocketServerConnection';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {MarkdownPipe} from '../../../../pipes/markdown-pipe';
import {UserDatePipe} from '../../../../pipes/user-date-pipe';
import {InterfaceService} from '../../../../services/interface-service';
import {Tooltip} from '../../../../directives/tooltip';
import {MessageDTOContentInner} from '../../../../../api/webrtc-server/model/messageDTOContentInner';
import {
  FileBracesCornerIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  LucideAngularModule
} from 'lucide-angular';
import {StorageFileURLPipe} from '../../../../pipes/avatar-pipe';
import {FileSizePipe} from '../../../../pipes/file-size-pipe';
import {fileMimetypeToIcon} from '../../../../mimetype-icons';
import {FilePreview} from '../../../ui/file-preview/file-preview';

@Component({
  selector: 'app-message',
  imports: [
    NgClass,
    IdenticonPipe,
    AsyncPipe,
    MarkdownPipe,
    UserDatePipe,
    Tooltip,
    LucideAngularModule,
    StorageFileURLPipe,
    FileSizePipe,
    FilePreview
  ],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  @Input() message!: MessageDTO;
  @Input() useHeader!: boolean;

  @Input() connection!: WebSocketServerConnection;

  constructor(protected interfaceService: InterfaceService) {
  }

  protected asTypeMarkdown(messageContainer: MessageDTOContentInner) {
    return messageContainer as MarkdownMessageContentDTO;
  }

  protected asTypeFile(messageContainer: MessageDTOContentInner) {
    return messageContainer as FileMessageContentDTO;
  }


  protected readonly fileMimetypeToIcon = fileMimetypeToIcon;
}
