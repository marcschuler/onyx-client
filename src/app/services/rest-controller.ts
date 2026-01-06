import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestConfiguration} from './websocket/WebSocketServerConnection';
import {ChatControllerService, ServerControllerService} from '../../api/webrtc-server';

@Injectable({
  providedIn: 'root'
})
export class RestController {

  constructor(private http: HttpClient) {
  }

  public createRestConfig(basePath: string, jwt: string | undefined): RestConfiguration {
    //TODO add jwt token
    return {
      jwt: jwt,
      serverController: new ServerControllerService(this.http, basePath),
      chatController: new ChatControllerService(this.http, basePath),
    }
  }

  public updateRestConfig(restConfiguration: RestConfiguration, jwt: string | undefined): RestConfiguration {
    return this.createRestConfig(restConfiguration.serverController.configuration.basePath!, jwt)
  }

}
