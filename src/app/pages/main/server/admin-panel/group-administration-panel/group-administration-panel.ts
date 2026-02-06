import {Component, Input, OnInit} from '@angular/core';
import {WebSocketServerConnection} from "../../../../../services/websocket/WebSocketServerConnection";
import {GroupDTO} from '../../../../../../api/webrtc-server';
import {RestService} from '../../../../../services/rest-service';
import {Spinner} from '../../../../../components/ui/spinner/spinner';
import {FormsModule} from '@angular/forms';
import {IdCardLanyard, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-group-administration-panel',
  imports: [
    Spinner,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './group-administration-panel.html',
  styleUrl: './group-administration-panel.css',
})
export class GroupAdministrationPanel implements OnInit {

  @Input() connection!: WebSocketServerConnection;

  groups: GroupDTO[] | undefined;

  constructor(private restService: RestService) {
  }

  ngOnInit(): void {
    this.connection.rest.groupController.all()
      .subscribe(value => {
        this.groups = value;
      }, error => this.restService.handleError(error));
  }

  groupFromParentId(id: string) {
    return this.groups?.filter(g => g.id == id)[0];
  }

  protected readonly navigator = navigator;
  protected readonly IdCardLanyard = IdCardLanyard;

  protected addGroup() {
    this.connection.rest.groupController.create2({
      name: "Group",
      description: ""
    }).subscribe(value => {
      this.groups?.push(value);
    })
  }
}
