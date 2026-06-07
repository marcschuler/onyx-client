import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {


  public notify(event: NotificationEvent) {
    const audio = new Audio();
    audio.src = event.src;
    audio.load();
    audio.play().then(() => {
      //do nothing
    }).catch(error => {
      console.error('Error playing sound ' + JSON.stringify(event), error);
    });
  }


}

export const NOTIFICATION_SOURCE_DOUBLE_HIGH = "/assets/sounds/double_high.wav";
export const NOTIFICATION_SOURCE_DOUBLE_NEUTRAL = "/assets/sounds/double_neutral.wav";
export const NOTIFICATION_SOURCE_SINGLE_HIGH = "/assets/sounds/single_high.wav";
export const NOTIFICATION_SOURCE_TRIPPLE_HIGH = "/assets/sounds/tripple_high.wav";


export const NOTIFICATION_MESSAGE_NEW: NotificationEvent = {
  src: NOTIFICATION_SOURCE_SINGLE_HIGH
}

export const NOTIFICATION_USER_JOINED_CHANNEL: NotificationEvent = {
  src: NOTIFICATION_SOURCE_DOUBLE_HIGH
}

export const NOTIFICATION_USER_LEFT_CHANNEL: NotificationEvent = {
  src: NOTIFICATION_SOURCE_DOUBLE_NEUTRAL
}

export interface NotificationEvent {
  src: string;
}

