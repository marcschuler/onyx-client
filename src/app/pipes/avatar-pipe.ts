import {Pipe, PipeTransform} from '@angular/core';
import {WebSocketServerConnection} from '../services/websocket/WebSocketServerConnection';
import {generateIdenteapot} from '@teapotlabs/identeapots';
import {FileDTO} from '../../api/webrtc-server';

@Pipe({
  name: 'storageFileURL',
})
export class StorageFileURLPipe implements PipeTransform {

  transform(file: string | FileDTO | undefined, connection: WebSocketServerConnection|undefined, basePath: string| undefined = undefined): string | any {
    if (file == undefined) {
      console.error("storageFileURLPipe: fileId is undefined")
      return;
    }
    const id = typeof file === 'string' ? file : file?.id;
    const path = connection ? connection.rest.basePath : basePath;
    if (path == undefined) {
      throw new Error("Neither connection nor basepath is set")
    }

    return path + "/v0/storage/" + id + "/download";
  }

}
