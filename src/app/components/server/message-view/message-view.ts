import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {
  CornerDownRightIcon,
  FileUpIcon,
  GhostIcon,
  LucideAngularModule,
  SendIcon,
  XIcon
} from 'lucide-angular';
import {WebSocketServerConnection} from '../../../services/websocket/WebSocketServerConnection';
import {deleteInList, getChannelFromId} from '../../../services/Util';
import {ToastService, ToastType} from '../../../services/ui/toast-service';
import {MessageHandler, WebSocketService} from '../../../services/websocket/web-socket-service';
import {MessageDTO} from '../../../../api/onyx-server/model/messageDTO';
import {NOTIFICATION_MESSAGE_NEW, NotificationService} from '../../../services/notification.service';
import {RestService} from '../../../services/rest/rest-service';
import {Message} from './message/message';
import {MessageService} from '../../../services/message-service';
import {
  ChannelChangeEvent,
  ChannelDTO,
  ChatMessageEvent,
  FileDTO, FileMessageContentDTO,
  MarkdownMessageContentDTO, MessageCreationDTOContentInner, MessageDeleteEvent
} from '../../../../api/onyx-server';
import {MessageContent} from '../../chat/message-content/message-content';
import {Chip} from '../../ui/chip/chip';
import {PreviewImage} from '../../ui/preview-image/preview-image';
import {removeItemFromList} from '../../../util';
import {mimeTypeHasImagePreview} from '../../../mimetype-icons';
import {ToggleButton} from '../../ui/toggle-button/toggle-button';
import {Tooltip} from '../../../directives/tooltip';
import {FileUploadService, UploadState, UploadType} from '../../../services/rest/file-upload-service';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-message-view',
  imports: [
    FormsModule,
    LucideAngularModule,
    Message,
    MessageContent,
    Chip,
    PreviewImage,
    ToggleButton,
    Tooltip,
    DecimalPipe
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
  private fileUploadService = inject(FileUploadService);


  protected readonly SendIcon = SendIcon;

  @Input() channelId!: string;
  @Input() connection!: WebSocketServerConnection;
  @Input() chatMode!: ChannelDTO.ChatModeEnum | undefined;

  messages: MessageDTO[] = [];
  currentPage: number | undefined = undefined;
  attachments: UploadState[] = [];

  protected useMarkdown: boolean = false;
  protected message = "";

  protected reply: MessageDTO | undefined = undefined;

  @ViewChild('messageList') private messageListElement!: ElementRef;

  @ViewChild('moreMessages') set moreMessagesElement(element: ElementRef) {
    if (element) {
      this.observeMessageList(element);
    }
  }

  private moreMessagesObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.webSocketService.addHandler(ChatMessageEvent.TypeEnum.ChatMessageEvent, this.onNewMessage);
    this.webSocketService.addHandler(MessageDeleteEvent.TypeEnum.MessageDeleteEvent, this.onMessageDelete);
    this.initMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channelId"]) {
      this.messages = [];
      this.reply = undefined;
      this.initMessages();
    }
  }

  ngOnDestroy(): void {
    this.webSocketService.removeHandler(this.onNewMessage);
    this.moreMessagesObserver?.disconnect()
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
    if (this.message.length == 0 && this.attachments.length == 0) {
      this.toastService.create({
        title: "Empty message",
        message: "The message cannot be empty",
        type: ToastType.Warning,
      });
      return;
    }
    if (this.attachments.filter(a => !a.done).length > 0) {
      this.toastService.create({
        title: "Uploads in progress",
        message: "There are uploads in progress. You can't send a message with incomplete uploads",
        type: ToastType.Warning,
      })
      return;
    }
    const channel = getChannelFromId(this.channelId, this.connection.data!.sections);
    if (!channel) {
      return;
    }

    const content: MessageCreationDTOContentInner[] = [];

    this.attachments.forEach(attachment => {
      content.push({
        type: "FILE",
        file: attachment.file!, //TODO check if upload is finished
      } as FileMessageContentDTO)
    })

    const message = this.messageService.convertLinksToMarkdownLinks(this.message);
    if (this.message.length != 0)
      content.push({
        text: message,
        type: this.useMarkdown ? "MARKDOWN" : "TEXT",
        repliesTo: this.reply ? this.reply.id : undefined
      } as MarkdownMessageContentDTO);

    console.log("message-view: sending message to channel/chat " + channel.id + "/" + channel.chatId, content);
    this.connection.rest.chatController.message(channel.chatId, {
      repliesTo: this.reply ? this.reply.id : undefined,
      content: content
    }).subscribe(() => {
      this.message = "";
      this.attachments = [];
      this.reply = undefined;
    }, error => this.restService.handleError(error))
  }

  protected async openFileUploadDialog($event?: any) {
    this.fileUploadService.fileFromDropOrDialog($event).then(
      file => {
        if (!file)
          return;
        this.fileUploadService.uploadFile(this.connection, file, UploadType.DEFAULT).subscribe(state => {
          const existing = this.attachments.findIndex(a => a.id == state.id);
          if (existing == -1) {
            this.attachments.push(state);
          } else {
            this.attachments[existing] = state;
          }
        }, error => this.restService.handleError(error))
      }
    )
  }

  protected removeAttachment(attachment: UploadState) {
    removeItemFromList(this.attachments, attachment);
  }

  onNewMessage: MessageHandler<ChatMessageEvent> = (event: ChatMessageEvent, connection) => {
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

  onMessageDelete: MessageHandler<MessageDeleteEvent> = (event: MessageDeleteEvent, connection: WebSocketServerConnection) => {
    const message = this.messages.find(msg => msg.id === event.id);
    if (message) {
      console.log("message-view: message in view deleted", message);
      deleteInList(this.messages, message);
    } else {
      console.log("message-view: message deleted but not in view", event);
    }
  }


  protected setReply($event: MessageDTO | undefined) {
    this.reply = $event;
    console.log("ui:message-view: replying to ", $event)
  }

  protected readonly CornerDownRightIcon = CornerDownRightIcon;
  protected readonly XIcon = XIcon;


  protected readonly mimeTypeHasImagePreview = mimeTypeHasImagePreview;
  protected readonly GhostIcon = GhostIcon;
  protected readonly FileUpIcon = FileUpIcon;
  removeOperationIdPrefix = true
}
