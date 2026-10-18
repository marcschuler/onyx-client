import {Injectable} from '@angular/core';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {defer, EMPTY, filter, from, map, Observable, switchMap} from 'rxjs';
import {FileDTO} from '../../../api/onyx-server';
import {WebSocketServerConnection} from '../websocket/WebSocketServerConnection';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {


  fileFromDialog() {
    return this.pickFile();
  }

  async fileFromDropOrDialog(event?: DragEvent) {
    if (event) {
      return this.fileFromDrop(event);
    } else {
      return await this.fileFromDialog();
    }
  }

  fileFromDrop(event: DragEvent): File | undefined {
    event.preventDefault();

    if (!event.dataTransfer || event.dataTransfer.files.length === 0)
      return undefined;

    return event.dataTransfer.files[0];
  }

  private pickFile(accept?: string): Promise<File | null> {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      if (accept)
        input.accept = accept;

      input.addEventListener('change', () => resolve(input.files?.[0] ?? null), {once: true});
      input.addEventListener('cancel', () => resolve(null), {once: true});

      input.click();
    });
  }


  uploadFile(connection: WebSocketServerConnection, file: File, type: UploadType): Observable<UploadState> {
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

    const id = crypto.randomUUID();
    const name = file.name;

    return observable.pipe(
      map((event): UploadState | null => {
        switch (event.type) {
          case HttpEventType.Sent:
            return {id, name, progress: 0, progressNice: "0%", done: false};
          case HttpEventType.UploadProgress:
            const progress = event.total ? event.loaded / event.total : 0;
            return {
              id,
              name,
              progress: progress,
              progressNice: Math.round(progress * 100) + "%",
              done: false,
            };
          case HttpEventType.Response:
            return {
              id,
              name,
              progress: 1,
              progressNice: "100%",
              done: true,
              file: event.body ?? undefined,
            };

          default:
            return null; // ResponseHeader, DownloadProgress, User
        }
      }),
      filter((state): state is UploadState => state !== null)
    );
  }
}

/**
 * the current upload state
 */
export interface UploadState {
  id: string; //random per-request id
  name: string; //the filename
  progress: number; //progrss from 0 - 1 (%)
  progressNice: string; //0% - 100%
  done: boolean; // true if done
  file?: FileDTO; //if done the file object is also set
}

export enum UploadType {
  DEFAULT,
  USER_AVATAR,
  SERVER_ICON
}
