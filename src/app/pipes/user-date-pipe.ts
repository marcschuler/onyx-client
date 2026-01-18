import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'userDate',
})
export class UserDatePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {
    const date = new Date(value);
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    if (isToday) {
      return time;
    }

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${time}, ${day}.${month}.${year}`;
  }

}
