import {Component, Input} from '@angular/core';
import {FileDTO} from '../../../../api/onyx-server';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';

export type ImageFit = 'cover' | 'contain';

@Component({
  selector: 'app-preview-image',
  imports: [
    StorageFileURLPipe
  ],
  templateUrl: './preview-image.html',
  styleUrl: './preview-image.css',
})
export class PreviewImage {

  @Input() connection!: WebSocketServerConnection;
  @Input() basePath: string | undefined;
  @Input() file!: FileDTO | string;

  @Input() fit: ImageFit = 'cover';
  @Input() sizes = '128px';

  protected fileAlt() {
    if (typeof this.file === 'string')
      return "Image preview for a file with ID " + this.file;
    return "File with name " + this.file.filename;
  }
}
