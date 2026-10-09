import {inject, Injectable} from '@angular/core';
import {RestService} from './rest-service';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {EMPTY, filter, map, Observable} from 'rxjs';
import {FileDTO} from '../../../api/onyx-server';
import {WebSocketServerConnection} from '../websocket/WebSocketServerConnection';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {

  uploadFileOnDrop(connection: WebSocketServerConnection, event: DragEvent, type: UploadType, onUpload: (state: UploadState) => void) {
    event.preventDefault();

    if (!event.dataTransfer || event.dataTransfer.files.length === 0)
      return EMPTY;

    const file = event.dataTransfer.files[0];
    return this.uploadFile(connection, file, type, onUpload);
  }


  uploadFile(connection: WebSocketServerConnection, file: File, type: UploadType, onUpload: (state: UploadState) => void): Observable<HttpEvent<FileDTO>> {
    console.log("fileUpload: selected file", file);

    let observable: Observable<HttpEvent<FileDTO>>;

    switch (type) {
      case UploadType.USER_AVATAR:
        console.log("Uploading user avatar");
        observable = connection.rest.userController
          .avatarUpload(connection.me.id, file, 'events', true);
        break;
      case UploadType.SERVER_ICON:
        console.log("Uploading server icon");
        observable = connection.rest.serverController.iconUpload(connection.data!.server.id, file, 'events', true);
        break;
      case UploadType.DEFAULT:
        console.log("Uploading file");
        observable = connection.rest.storageController
          .uploadFile(file, 'events', true);
        break;
      default:
        throw new Error("Invalid upload type " + type)
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
            //this.uploaded.emit(event.body!)
            return {
              status: 'done' as const,
              body: event.body as FileDTO
            };
          default:
            return {status: 'pending' as const};
        }
      }),
      filter(e => e.status === 'progress' || e.status === 'done'))
    return observable;
  }

}

export interface UploadState {
  name: string;
  progresss: number;
}

export enum UploadType {
  DEFAULT,
  USER_AVATAR,
  SERVER_ICON
}
