import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ArrowBigRightDash, LucideAngularModule, ServerIcon, ServerOffIcon} from "lucide-angular";
import {PreviewImage} from "../../../../components/ui/preview-image/preview-image";
import {Spinner} from "../../../../components/ui/spinner/spinner";
import {ServerDetails, ServerLoaderService} from '../../../../services/server-loader-service';
import {RestService} from '../../../../services/rest-service';
import {ServerDTO} from '../../../../../api/onyx-server';

@Component({
  selector: 'app-server-entry',
  imports: [
    LucideAngularModule,
    PreviewImage,
    Spinner
  ],
  templateUrl: './server-entry.html',
  styleUrl: './server-entry.css',
})
export class ServerEntry implements OnInit, OnDestroy {

  protected serverLoaderService = inject(ServerLoaderService);
  private restService = inject(RestService);

  @Input() server!: ServerDetails;
  @Input() selectedServer: ServerDetails | undefined;
  @Output() onSelection = new EventEmitter<ServerDetails>();

  protected state: ServerInfoWithState = {
    error: undefined,
    success: undefined,
    state: ServerInfoState.CONNECTING
  };
  private interval!: number;

  ngOnInit(): void {
    this.updateDetails();
    this.interval = window.setInterval(() => this.updateDetails(), 8_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  protected connect() {
    if (this.selectedServer)
      return;
    this.onSelection.emit(this.server);
  }

  updateDetails() {
    this.serverLoaderService.serverDetails(this.server)
      .then(serverDetail => {
        this.state = {
          state: ServerInfoState.SUCCESS,
          error: undefined,
          success: serverDetail
        };
      })
      .catch(error => {
        this.state = {
          state: ServerInfoState.ERROR,
          success: undefined,
          error: this.restService.buildErrorMessage(error)
        }
      })
  }

  protected readonly ServerInfoState = ServerInfoState;
  protected readonly ServerIcon = ServerIcon;
  protected readonly ServerOffIcon = ServerOffIcon;
  protected readonly ArrowBigRightDash = ArrowBigRightDash;
}

export interface ServerInfoWithState {
  state: ServerInfoState;
  success: ServerDTO[] | undefined;
  error: string | undefined;
}

export enum ServerInfoState {
  CONNECTING,
  SUCCESS,
  ERROR
}
