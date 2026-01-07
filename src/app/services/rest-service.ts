import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RestConfiguration} from './websocket/WebSocketServerConnection';
import {ChatControllerService, Configuration, ServerControllerService} from '../../api/webrtc-server';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) {
  }

  public createRestConfig(basePath: string, jwt: string | undefined): RestConfiguration {
    //TODO add jwt token
    const config = jwt ? new Configuration({
      credentials: {
        "jwt-auth": jwt
      }
    }) : new Configuration();
    return {
      jwt: jwt,
      serverController: new ServerControllerService(this.http, basePath, config),
      chatController: new ChatControllerService(this.http, basePath, config),
    }
  }

  public updateRestConfig(restConfiguration: RestConfiguration, jwt: string | undefined): RestConfiguration {
    return this.createRestConfig(restConfiguration.serverController.configuration.basePath!, jwt)
  }

}
