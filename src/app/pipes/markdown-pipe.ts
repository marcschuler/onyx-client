import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked, RendererObject, Tokens} from 'marked';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {

  }


  transform(value: string): unknown {
    const sanitizer = this.sanitizer;
    const renderer: RendererObject = {
      link(this, token) {
        const href = sanitizer.sanitize(SecurityContext.URL,token.href);
        const text = sanitizer.sanitize(SecurityContext.HTML, token.text);

        return `
      <a href="${href}" target="_blank">
      ${text}
      </a>
    `;
      },
      image({href, title, text, tokens}: Tokens.Image) {


        const titleAttr = title ? ` title="${title}"` : '';
        const altAttr = text  ? ` alt="${text}"`   : '';
        return sanitizer.bypassSecurityTrustHtml( `
      <app-chat-image src="${href}" ${altAttr}${titleAttr}>
      </app-chat-image>
    `) as any;
      }
    };
    marked.use({
      gfm: true,
      breaks: true,
      renderer
    });
    return marked.parse(value);
  }

}
