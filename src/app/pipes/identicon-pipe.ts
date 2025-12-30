import {Pipe, PipeTransform} from '@angular/core';
import {generateIdenteapot} from '@teapotlabs/identeapots';

@Pipe({
  name: 'identicon'
})
export class IdenticonPipe implements PipeTransform {

  async transform(value: string, size: number = 256): Promise<string> {
    return await generateIdenteapot(value, {
      size: size,
    });
  }

}
