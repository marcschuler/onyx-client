import {Component, Input, OnInit} from '@angular/core';
import {FileDTO} from '../../../../api/onyx-server';
import {fileMimetypeToIcon, FileType, mimeTypeToFileType} from '../../../mimetype-icons';
import {StorageFileURLPipe} from '../../../pipes/avatar-pipe';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {PreviewImage} from '../preview-image/preview-image';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-file-preview',
  imports: [
    StorageFileURLPipe,
    PreviewImage,
    JsonPipe
  ],
  templateUrl: './file-preview.html',
  styleUrl: './file-preview.css',
})
export class FilePreview implements OnInit {


  @Input() file!: FileDTO;
  @Input() connection!: WebSocketServerConnection;

  fileType?: FileType;

  ngOnInit(): void {
    this.fileType = mimeTypeToFileType(this.file.contentType);
  }

  protected readonly FileType = FileType;
  protected readonly fileMimetypeToIcon = fileMimetypeToIcon;
}
