import {Component, Input, signal} from '@angular/core';
import {MarkdownMessageContentDTO} from '../../../../../../../api/webrtc-server';
import {Popup} from '../../../../../../components/ui/popup/popup';

@Component({
  selector: 'app-name-description-popup',
  imports: [
    Popup
  ],
  templateUrl: './name-description-popup.html',
  styleUrl: './name-description-popup.css'
})
export class NameDescriptionPopup {

  @Input() entity!: {name: string,description?:MarkdownMessageContentDTO};

  internalEntity = signal({
    name: "",
    description: undefined
  })
/*
  internalForm = form(this.internalEntity,(schemaPath)=>{
    minLength(schemaPath.name,3,{message:'Name must be at least three characters long'})
  })*/

}
