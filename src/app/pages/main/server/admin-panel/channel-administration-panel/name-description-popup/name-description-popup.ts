import {Component, EventEmitter, Input, OnChanges, OnInit, Output, signal} from '@angular/core';
import {MarkdownMessageContentDTO} from '../../../../../../../api/webrtc-server';
import {
  Button,
  BUTTON_CANCEL,
  BUTTON_DELETE,
  BUTTON_EDIT,
  ButtonType,
  Popup
} from '../../../../../../components/ui/popup/popup';
import {form, FormField, minLength} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-name-description-popup',
  imports: [
    Popup,
    FormField,
    FormsModule
  ],
  templateUrl: './name-description-popup.html',
  styleUrl: './name-description-popup.css'
})
export class NameDescriptionPopup implements OnInit, OnChanges {


  @Input() entity!: { name: string, description?: MarkdownMessageContentDTO };

  internalEntity!: { name: string, description?: MarkdownMessageContentDTO };

  @Output() entityChanges = new EventEmitter<{ name: string, description?: MarkdownMessageContentDTO }>();

  ngOnInit(): void {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    this.internalEntity = JSON.parse(JSON.stringify(this.entity));
  }

  protected readonly BUTTON_DELETE = BUTTON_DELETE;
  protected readonly BUTTON_CANCEL = BUTTON_CANCEL;
  protected readonly BUTTON_EDIT = BUTTON_EDIT;

  protected onClose(type: Button) {
    if (type == BUTTON_EDIT) {
      this.entityChanges.emit(this.internalEntity);
    }else{
      this.entityChanges.emit(undefined);
    }
  }
}
