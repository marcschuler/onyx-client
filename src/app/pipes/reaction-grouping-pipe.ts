import { Pipe, PipeTransform } from '@angular/core';
import {MessageReactionDTO} from '../../api/onyx-server';

/**
 * Groups reactions by emoji. Groups are ordered by the first occurrence of
 * their emoji in the input; reactions inside a group keep their input order.
 */
@Pipe({
  name: 'reactionGrouping'
})
export class ReactionGroupingPipe implements PipeTransform {

  transform(value: MessageReactionDTO[]): ReactionGroup[] {
    const groups = new Map<string, ReactionGroup>();
    for (const reaction of value) {
      let group = groups.get(reaction.emoji);
      if (!group) {
        group = { emoji: reaction.emoji, reactions: [] };
        groups.set(reaction.emoji, group);
      }
      group.reactions.push(reaction);
    }
    return Array.from(groups.values());
  }

}

export interface ReactionGroup{
  emoji: string;
  reactions: MessageReactionDTO[];
}
