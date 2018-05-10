// Custom pipe to round the number
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myRoundPipe' })
export class RoundPipe implements PipeTransform {
  public transform(value: number): number {
    return Math.round(value);
  }
}
