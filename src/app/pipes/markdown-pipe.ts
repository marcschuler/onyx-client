import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked, RendererObject} from 'marked';
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
    };
    marked.use({
      gfm: true,
      breaks: true,
      renderer
    });
    return marked.parse(value);
  }

}
