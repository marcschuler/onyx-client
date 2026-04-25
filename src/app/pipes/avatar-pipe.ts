import {Pipe, PipeTransform} from '@angular/core';
import {WebSocketServerConnection} from '../services/websocket/WebSocketServerConnection';
import {generateIdenteapot} from '@teapotlabs/identeapots';

@Pipe({
  name: 'storageFileURL',
})
export class StorageFileURLPipe implements PipeTransform {

  transform(fileId: string | undefined, connection: WebSocketServerConnection): string | any {
    if (fileId)
      return connection.rest.basePath + "/v0/storage/" + fileId + "/download";
    console.error("storageFileURLPipe: fileId is undefined")
  }

}
