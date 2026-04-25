import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
  private static readonly UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

  transform(bytes: number): string {
    if (bytes === 0) return '0 B';

    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      FileSizePipe.UNITS.length - 1
    );

    const value = bytes / Math.pow(1024, i);
    return `${i === 0 ? value : value.toFixed(1)} ${FileSizePipe.UNITS[i]}`;
  }

}
