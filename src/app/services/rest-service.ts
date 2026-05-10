import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {RestConfiguration} from './websocket/WebSocketServerConnection';
import {
  ChannelControllerService,
  ChatControllerService,
  Configuration, GroupControllerService, PolicyControllerService, SectionControllerService,
  ServerControllerService, ServerDescriptionControllerService, StorageControllerService, UserControllerService
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
    this.statusCodeEmojis[0] = "🌏";
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
      basePath: basePath,
      serverController: new ServerControllerService(this.http, basePath, config),
      serverDescriptionController: new ServerDescriptionControllerService(this.http, basePath, config),
      chatController: new ChatControllerService(this.http, basePath, config),
      channelController: new ChannelControllerService(this.http, basePath, config),
      sectionController: new SectionControllerService(this.http, basePath, config),
      userController: new UserControllerService(this.http, basePath, config),
      groupController: new GroupControllerService(this.http, basePath, config),
      policyController: new PolicyControllerService(this.http, basePath, config),
      storageController: new StorageControllerService(this.http,basePath, config),
    }
  }

  public updateRestConfig(restConfiguration: RestConfiguration, jwt: string | undefined): RestConfiguration {
    return this.createRestConfig(restConfiguration.serverController.configuration.basePath!, jwt)
  }

  public handleError(error: HttpErrorResponse) {
    console.error(JSON.stringify(error))

    this.toastService.create({
      title: this.buildErrorTitle(error),
      type: ToastType.Error,
      message: this.buildErrorMessage(error)
    })
  }

  public buildErrorTitle(error: HttpErrorResponse): string {
    var title = error.status + " " + error.statusText
    if (error.error && error.error.title) {
      title = error.error.title;
    }
    if (error.status === 0) {
      title = "No Connection"
    }
    const emoji: string | undefined = this.statusCodeEmojis[error.status];
    if (emoji)
      title = emoji + " " + title
    return title;
  }

  public buildErrorMessage(error: HttpErrorResponse): string {
    if (error.status == 0 || error.status == undefined) {
      return "No Connection to server";
    }
    return error.error.detail || JSON.stringify(error.error);
  }

}
