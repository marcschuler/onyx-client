import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FileUpIcon, ImageUpIcon, LucideAngularModule} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ToastService, ToastType} from '../../../services/toast-service';
import {RestService} from '../../../services/rest-service';
import {filter, map, Observable} from 'rxjs';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {FileDTO} from '../../../../api/webrtc-server';
import {Spinner} from '../spinner/spinner';

@Component({
  selector: 'app-file-upload',
  imports: [
    LucideAngularModule,
    Spinner
  ],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUpload {

  @Input() connection!: WebSocketServerConnection;

  @Input() avatar: boolean = false;
  @Input() ghost: boolean = true;

  @Output() uploaded = new EventEmitter<FileDTO>();

  file: File | undefined;

  uploadPercentage: undefined | number = undefined;

  constructor(private toastService: ToastService, private restService: RestService) {

  }


  uploadFile(file: File) {
    this.file = file;
    console.log("fileUpload: selected file", file);

    if (this.uploadPercentage !== undefined) {
      this.toastService.create({
        title: "File Upload already in progress",
        message: "Can not upload two files at the same time",
        type: ToastType.Warning
      })
    }

    let observable: Observable<HttpEvent<FileDTO>>;

    if (this.avatar) {
      observable = this.connection.rest.userController
        .uploadMedia(this.connection.me.id, file, 'events', true);
    } else {
      observable = this.connection.rest.storageController
        .uploadFile(file, 'events', true);
    }
    observable.pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return {
              status: 'progress' as const,
              percent: event.total ? Math.round(100 * event.loaded / event.total) : 0
            };
          case HttpEventType.Response:
            this.uploaded.emit(event.body!)
            return {
              status: 'done' as const,
              body: event.body as FileDTO
            };
          default:
            return {status: 'pending' as const};
        }
      }),
      filter(e => e.status === 'progress' || e.status === 'done')
    )
      .subscribe({
        next: event => {
          if (event.status === 'progress') {
            this.uploadPercentage = event.percent;
            console.log("fileUpload: Upload: " + event.percent + "%")
          } else if (event.status === 'done') {
            console.log('fileUpload: Upload complete', event.body);
            this.uploadPercentage = undefined;
          }
        },
        error: err => {
          this.uploadPercentage = undefined;
          this.restService.handleError(err);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;

    const file = event.dataTransfer.files[0];
    this.uploadFile(file);
  }

  protected readonly FileUpIcon = FileUpIcon;
  protected readonly ImageUpIcon = ImageUpIcon;
}
