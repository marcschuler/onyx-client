import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {LucideAngularModule, SendIcon} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {getChannelFromId} from '../../../services/Util';
import {ToastService, ToastType} from '../../../services/toast-service';
import {MessageHandler, WebSocketService} from '../../../services/websocket/web-socket-service';
import {MessageDTO} from '../../../../api/webrtc-server/model/messageDTO';
import {NOTIFICATION_MESSAGE_NEW, NotificationService} from '../../../services/notification.service';
import {RestService} from '../../../services/rest-service';
import {Message} from './message/message';
import {MessageService} from '../../../services/message-service';
import {
  ChatMessageEvent,
  FileDTO,
  FileMessageContentDTO,
  MarkdownMessageContentDTO
} from '../../../../api/webrtc-server';
import {FileUpload} from '../../ui/file-upload/file-upload';

@Component({
  selector: 'app-message-view',
  imports: [
    FormsModule,
    LucideAngularModule,
    Message,
    FileUpload
  ],
  templateUrl: './message-view.html',
  styleUrl: './message-view.css'
})
export class MessageView implements OnInit, OnDestroy, OnChanges, OnDestroy {
  private toastService = inject(ToastService);
  private webSocketService = inject(WebSocketService);
  private restService = inject(RestService);
  private messageService = inject(MessageService);
  private notificationService = inject(NotificationService);


  protected readonly SendIcon = SendIcon;

  @Input() channelId!: string;
  @Input() connection!: WebSocketServerConnection;

  messages: MessageDTO[] = [];
  currentPage: number | undefined = undefined;

  message = "";

  @ViewChild('messageList') private messageListElement!: ElementRef;

  @ViewChild('moreMessages') set moreMessagesElement(element: ElementRef) {
    if (element) {
      this.observeMessageList(element);
    }
  }

  private moreMessagesObserver?: IntersectionObserver;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channelId"]) {
      this.messages = [];
      this.initMessages();
    }
  }

  observeMessageList(element: ElementRef) {
    if (this.moreMessagesObserver) return;
    this.moreMessagesObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log("Loading older messages")
          this.loadMessages(); // your function
        }
      });
    }, {threshold: 0.1}); // 0.1 = 10% visible triggers it

    this.moreMessagesObserver.observe(element.nativeElement);
  }

  initMessages() {
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    this.messages = [];
    this.currentPage = undefined;
    this.connection.rest.chatController.messagesLatest(channel!.chatId, 50).subscribe(messages => {
      this.addMessageToList(messages.content || []);
      this.currentPage = messages.pageable?.pageNumber || undefined;
      console.log("message-view: Got newest " + messages.content?.length + " messages from " + messages.totalElements + " in chat")
    }, error => this.restService.handleError(error));
  }

  protected loadMessages() {
    if (this.currentPage == undefined || this.currentPage == 0) {
      console.error("message-view: could not load more messages. Current page is " + this.currentPage);
      return;
    }
    console.log("message-view: current page is " + this.currentPage + ". Loading page " + (this.currentPage - 1));
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    this.connection.rest.chatController.messages(channel!.chatId, {
      page: this.currentPage - 1,
      size: 50
    }).subscribe(messages => {
      this.addMessageToList(messages.content || []);
      this.currentPage = messages.pageable?.pageNumber || undefined;
      console.log("message-view: Got newest " + messages.content?.length + " messages from " + messages.totalElements + " in chat")
    }, error => this.restService.handleError(error));
  }


  ngOnInit(): void {
    this.webSocketService.addHandler(ChatMessageEvent.TypeEnum.ChatMessageEvent, this.incomeMessageHandler);
    this.initMessages();
  }

  ngOnDestroy(): void {
    this.webSocketService.removeHandler(this.incomeMessageHandler);
    this.moreMessagesObserver?.disconnect()
  }

  addMessageToList(messages: MessageDTO[]) {
    for (const message of messages) {
      this.messages.push(message);
    }
    //remove duplicates, e.g. from duplicate calls to updateMessages
    this.messages = this.messages.filter(
      (item, index, self) => index === self.findIndex(i => i.id === item.id)
    );

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
      return;
    }
    const message = this.messageService.convertLinksToMarkdownLinks(this.message);
    console.log("message-view: sending message to channel/chat " + channel.id + "/" + channel.chatId);
    this.connection.rest.chatController.message(channel.chatId, {
      text: message,
      type: "MARKDOWN"
    } as MarkdownMessageContentDTO).subscribe(() => {
      this.message = "";
    }, error => this.restService.handleError(error))
  }

  protected onFileUpload($event: FileDTO) {
    console.log("message-view: file was uploaded, crafting message")
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    if (!channel) {
      return;
    }
    this.connection.rest.chatController.message(channel.chatId, {
      type: "FILE",
      file: $event
    } as FileMessageContentDTO)
      .subscribe(() => {
        console.log("message-view: send file chat")
        this.toastService.create({
          title: "File uploaded to chat",
          type: ToastType.Success
        })
      }, error => this.restService.handleError(error))
  }

  incomeMessageHandler: MessageHandler<ChatMessageEvent> = (event: ChatMessageEvent, connection) => {
    console.log("message-view: received new message " + JSON.stringify(event));
    if (!this.connection.selectedChannel) {
      console.log("message-view: Ignoring message, no channel selected");
      return;
    }
    const currentChatId = getChannelFromId(this.connection.selectedChannel, connection.data!.sections)?.chatId;
    if (currentChatId != event.chatId) {
      console.log("message-view: Ignoring message, other chat selected (" + currentChatId + "!=" + event.chatId + ")");
      return;
    }
    this.addMessageToList([event.message]);
    if (event.message.user.id !== connection.identity.id)
      this.notificationService.notify(NOTIFICATION_MESSAGE_NEW)

  };


}
