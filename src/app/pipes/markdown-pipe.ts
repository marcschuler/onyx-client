import {Pipe, PipeTransform} from '@angular/core';
import {marked} from 'marked';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {

  transform(value: string): unknown {
    marked.use({
      gfm: true,
      breaks: true
    })
    return marked.parse(value);
  }

}
