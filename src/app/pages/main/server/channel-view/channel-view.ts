import {Component, Input} from '@angular/core';
import {ServerObjectId} from '../../../../services/websocket/WebSocketEvents';
import {BrushCleaningIcon, LucideAngularModule} from 'lucide-angular';
import {WebSocketService} from '../../../../services/websocket/web-socket-service';
import {PeerConnectionService} from '../../../../services/peer/peer-connection-service';
import {PeerView} from '../../../../components/server/peer-view/peer-view';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-channel-view',
  imports: [
    LucideAngularModule,
    PeerView,
  ],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.css'
})
export class ChannelView {

  @Input() channelId!: ServerObjectId;

  gridRows: number=1;
  gridCols: number =1;

  protected readonly BrushCleaningIcon = BrushCleaningIcon;

  constructor(protected webSocketService: WebSocketService,
              protected peerConnectionService: PeerConnectionService,) {
    setInterval(()=> this.updateGrid(),1000); //TODO this is not good
  }

  updateGrid(): void {
    const num = this.peerConnectionService.peers.length;
    //TODO there probably is a clever mathematical way to do this, but I don't care right now
    if (num<=1){
      this.gridRows = 1;
      this.gridRows = 1;
    }else if (num<=2){
      this.gridRows = 1;
      this.gridCols = 2;
    }else if (num<=4){
      this.gridRows = 2;
      this.gridCols = 2;
    }else if (num<=6){
      this.gridRows = 3;
      this.gridCols = 2;
    }//TODO
  }
}
