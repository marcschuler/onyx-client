import {Component, Input} from '@angular/core';
import {FileDTO, PreviewFormat} from '../../../../api/onyx-server';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-preview-image',
  imports: [
    StorageFileURLPipe,
    NgClass
  ],
  templateUrl: './preview-image.html',
  styleUrl: './preview-image.css',
})
export class PreviewImage {

  @Input() connection!: WebSocketServerConnection;
  @Input() basePath: string | undefined;
  @Input() file!: FileDTO | string;

  @Input() imageClass  ="w-32 h-32 rounded-xl object-cover"

  options!: FilePreviewOption[];

  constructor() {
    this.generateOptions();
  }

  generateOptions() {
    this.options = Object.values(PreviewFormat).map(pf => {
      return {
        size: 1
      } as FilePreviewOption
    });
  }

  protected fileAlt() {
    if (typeof this.file === 'string')
      return "Image preview for a file with ID " + this.file;
    return "File with name " + this.file.filename;
  }
}

interface FilePreviewOption {
  size: number;
}
