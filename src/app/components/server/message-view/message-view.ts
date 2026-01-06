import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrushCleaningIcon, LucideAngularModule, SendIcon} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {getChannelFromId} from '../../../services/Util';
import {ToastService, ToastType} from '../../../services/toast-service';
import {MessageHandler, WebSocketService} from '../../../services/websocket/web-socket-service';
import {IncomeMessageEvent, MessageDTO} from '../../../../api/webrtc-server';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-message-view',
  imports: [
    FormsModule,
    LucideAngularModule,
    DatePipe
  ],
  templateUrl: './message-view.html',
  styleUrl: './message-view.css'
})
export class MessageView implements OnInit, OnDestroy {

  protected readonly SendIcon = SendIcon;

  @Input() channelId!: string;
  @Input() connection!: WebSocketServerConnection;

  messages: MessageDTO[] = [];

  message: string = "";

  incomeMessageHandler: MessageHandler<IncomeMessageEvent> = (event: IncomeMessageEvent, connection) => {
    //TODO check if it is THIS chat
    console.log("received new message " + JSON.stringify(event));
    this.messages.push(event.message);
  };

  constructor(private toastService: ToastService,
              private webSocketService: WebSocketService) {

  }

  updateMessages() {
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    this.connection.rest.chatController.messages(channel!.chatId).subscribe(messages => {
      console.log("messages are " + JSON.stringify(messages));
      if (messages == undefined || messages.length == undefined) {
        console.warn("no messages received");
        return;
      }
      console.log("Got " + messages.length + " messages in chat")
      this.messages = messages;
    })
  }

  ngOnInit(): void {
    this.webSocketService.addHandler(IncomeMessageEvent.TypeEnum.IncomeMessageEvent, this.incomeMessageHandler);
    this.updateMessages();
  }

  ngOnDestroy(): void {
    this.webSocketService.removeHandler(this.incomeMessageHandler);
  }

  sendMessage() {
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
    })
  }
}
