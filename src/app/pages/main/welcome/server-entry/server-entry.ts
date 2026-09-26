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

  state: ServerInfoState = ServerInfoState.CONNECTING;
  success: ServerDTO | undefined;
  error: string | undefined;

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
        if (serverDetail.length != 1) {
          console.error("Received unexpected server length", serverDetail);
        }
        this.state = ServerInfoState.SUCCESS;
        this.error = undefined;
        this.success = serverDetail[0]
      })
      .catch(error => {
        this.state = ServerInfoState.ERROR;
        this.success = undefined;
        this.error = this.restService.buildErrorMessage(error)
      })
  }

  protected readonly ServerInfoState = ServerInfoState;
  protected readonly ServerIcon = ServerIcon;
  protected readonly ServerOffIcon = ServerOffIcon;
}

export enum ServerInfoState {
  CONNECTING,
  SUCCESS,
  ERROR
}
