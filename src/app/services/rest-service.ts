import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {RestConfiguration} from './websocket/WebSocketServerConnection';
import {
  ChannelControllerService,
  ChatControllerService,
  Configuration,
  ServerControllerService
} from '../../api/webrtc-server';
import {ToastService, ToastType} from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  // Error status code as emoji, inspired (or copied) from https://mastodon.social/@SusanPotter/109396561230136241
  statusCodeEmojis: string[] = [];

  constructor(private http: HttpClient,
              private toastService: ToastService) {
    this.statusCodeEmojis[400] = "👎";
    this.statusCodeEmojis[401] = "🔐";
    this.statusCodeEmojis[402] = "💳️";
    this.statusCodeEmojis[403] = "⛔️";
    this.statusCodeEmojis[404] = "🔐";
    this.statusCodeEmojis[410] = "🪦";
    this.statusCodeEmojis[418] = "🫖"; // very important, do not delete
    this.statusCodeEmojis[451] = "🔥";
    this.statusCodeEmojis[500] = "😱";
    this.statusCodeEmojis[501] = "😈";
    this.statusCodeEmojis[502] = "🖕";
    this.statusCodeEmojis[503] = "☠️";
    this.statusCodeEmojis[504] = "⌛️💀️";
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
      channelController: new ChannelControllerService(this.http, basePath, config)
    }
  }

  public updateRestConfig(restConfiguration: RestConfiguration, jwt: string | undefined): RestConfiguration {
    return this.createRestConfig(restConfiguration.serverController.configuration.basePath!, jwt)
  }

  public handleError(error: HttpErrorResponse) {
    console.error(JSON.stringify(error))
    var description = error.status + " " + error.statusText
    if (error.error && error.error.title) {
      description = error.error.title;
    }
    const emoji: string | undefined = this.statusCodeEmojis[error.status];
    if (emoji)
      description = emoji + " " + description
    const text = error.error.detail || JSON.stringify(error.error)
    this.toastService.create({
      title: description,
      type: ToastType.Error,
      message: text
    })
  }

}
