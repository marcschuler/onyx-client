import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {FileUpIcon, ImageUpIcon, LucideAngularModule} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {RestService} from '../../../services/rest/rest-service';
import {filter, map, Observable} from 'rxjs';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {FileDTO} from '../../../../api/onyx-server';
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
  private toastService = inject(ToastService);
  private restService = inject(RestService);


  @Input() connection!: WebSocketServerConnection;

  @Input() type: any;
  @Input() ghost = true;

  @Output() uploaded = new EventEmitter<FileDTO>();

  file: File | undefined;

  uploadPercentage: undefined | number = undefined;



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;

    const file = event.dataTransfer.files[0];
  }

  protected readonly FileUpIcon = FileUpIcon;
  protected readonly ImageUpIcon = ImageUpIcon;
}

