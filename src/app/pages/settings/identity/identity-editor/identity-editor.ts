import {Component, EventEmitter, inject, Input, OnChanges, Output} from '@angular/core';
import {AsyncPipe, DatePipe, SlicePipe} from '@angular/common';
import {LucideCalendar, LucideKeyRound, LucideTrash, LucideTrash2} from '@lucide/angular';
import {IdenticonPipe} from '../../../../pipes/identicon-pipe';
import {FormsModule} from '@angular/forms';
import {Identity, IdentityService} from '../../../../services/identity-service';
import {ToastService, ToastType} from '../../../../services/ui/toast-service';

/**
 * Edits a single identity (currently only the username)
 */
@Component({
  selector: 'app-identity-editor',
  imports: [
    FormsModule,
    DatePipe,
    SlicePipe,
    AsyncPipe,
    IdenticonPipe,
    LucideKeyRound,
    LucideCalendar,
    LucideTrash2,
    LucideTrash,
  ],
  templateUrl: './identity-editor.html',
  styleUrl: './identity-editor.css',
})
export class IdentityEditor implements OnChanges {
  private identityService = inject(IdentityService);
  private toastService = inject(ToastService);

  @Input() identity!: Identity;
  @Input() deletable = true;
  @Input() isDefault = false; // the first identity is used by default

  @Output() delete = new EventEmitter<Identity>();

  protected username = "";
  protected saving = false;

  ngOnChanges() {
    this.username = this.identity.username;
  }

  protected get trimmedUsername() {
    return this.username.trim();
  }

  protected get changed() {
    return this.trimmedUsername !== this.identity.username;
  }

  protected get valid() {
    return this.trimmedUsername.length >= 3; // same rule as the identity wizard
  }

  protected async save() {
    if (!this.changed || !this.valid || this.saving)
      return;
    this.saving = true;
    try {
      await this.identityService.rename(this.identity, this.trimmedUsername);
      this.username = this.identity.username;
      this.toastService.create({
        type: ToastType.Success,
        title: "Identity renamed",
        message: "Servers you are connected to will see the new name after reconnecting",
      });
    } catch (e) {
      console.error("identity: could not rename identity", e);
      this.toastService.create({type: ToastType.Error, title: "Could not rename identity"});
    } finally {
      this.saving = false;
    }
  }

  protected reset() {
    this.username = this.identity.username;
  }
}
