import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {LucideAngularModule, SendIcon} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {getChannelFromId} from '../../../services/Util';
import {ToastService, ToastType} from '../../../services/toast-service';
import {MessageHandler, WebSocketService} from '../../../services/websocket/web-socket-service';
import {IncomeMessageEvent} from '../../../../api/webrtc-server';
import {DatePipe} from '@angular/common';
import {MessageDTO} from '../../../../api/webrtc-server/model/messageDTO';
import {MarkdownPipe} from '../../../pipes/markdown-pipe';
import {Message} from 'postcss';
import {NOTIFICATION_MESSAGE_NEW, NotificationService} from '../../../services/notification.service';
import {RestService} from '../../../services/rest-service';

@Component({
  selector: 'app-message-view',
  imports: [
    FormsModule,
    LucideAngularModule,
    DatePipe,
    MarkdownPipe
  ],
  templateUrl: './message-view.html',
  styleUrl: './message-view.css'
})
export class MessageView implements OnInit, OnDestroy, OnChanges {

  protected readonly SendIcon = SendIcon;

  @Input() channelId!: string;
  @Input() connection!: WebSocketServerConnection;

  messages: MessageDTO[] = [];

  message: string = "";

  @ViewChild('messageList') private messageListElement!: ElementRef;


  incomeMessageHandler: MessageHandler<IncomeMessageEvent> = (event: IncomeMessageEvent, connection) => {
    //TODO check if it is THIS chat. Could be depending on the server response but might not be
    console.log("received new message " + JSON.stringify(event));
    this.addMessageToList([event.message]);
    if (event.message.user.id !== connection.identity.id)
      this.notificationService.notify(NOTIFICATION_MESSAGE_NEW)

  };

  constructor(private toastService: ToastService,
              private webSocketService: WebSocketService,
              private restService: RestService,
              private notificationService: NotificationService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channelId"]) {
      this.messages = [];
      this.updateMessages();
    }
  }

  updateMessages() {
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    this.connection.rest.chatController.messages(channel!.chatId).subscribe(messages => {

      if (messages == undefined || messages.length == undefined) {
        console.warn("no messages received");
        return;
      }
      console.log("Got " + messages.length + " messages in chat")
      this.addMessageToList(messages);
    }, error => this.restService.handleError(error))
  }

  ngOnInit(): void {
    this.webSocketService.addHandler(IncomeMessageEvent.TypeEnum.IncomeMessageEvent, this.incomeMessageHandler);
    this.updateMessages();
  }

  ngOnDestroy(): void {
    this.webSocketService.removeHandler(this.incomeMessageHandler);
  }

  addMessageToList(messages: MessageDTO[]) {
    for (const message of messages) {
      this.messages.push(message);
    }
    //TODO remove duplicates

    // sort the messages by date in case they are in wrong order
    this.messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    })
    setTimeout(() => {
      this.messageListElement.nativeElement.scrollTop = this.messageListElement.nativeElement.scrollHeight;
    }, 100)
  }

  sendMessage(event?: KeyboardEvent) {
    if (event && !event.shiftKey) {
      event.preventDefault();
    }
    if (this.message.length == 0) {
      this.toastService.create({
        title: "Empty message",
        message: "The message cannot be empty",
        type: ToastType.Warning,
        duration: 3000
      });
      return;
    }
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    if (!channel) {
      this.toastService.create({
        title: 'Internal Client Error',
        message: 'Could not find the chat you are trying to send this message',
        type: ToastType.Error,
        duration: 5000
      });
      return;
    }
    console.log("sending message to channel/chat " + channel.id + "/" + channel.chatId);
    this.connection.rest.chatController.message(channel.chatId, {
      markdown: this.message
    }).subscribe(value => {
      this.message = "";
      console.log("Message send");
    }, error => this.restService.handleError(error))
  }
}
