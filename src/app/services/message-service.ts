import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {


  public convertLinksToMarkdownLinks(text:string){
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `[${url}](${url})`);
  }

}
