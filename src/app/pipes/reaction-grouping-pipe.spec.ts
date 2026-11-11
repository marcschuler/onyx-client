import { ReactionGroupingPipe } from './reaction-grouping-pipe';
import { MessageReactionDTO } from '../../api/onyx-server';

function reaction(id: string, emoji: string, username = `user-${id}`): MessageReactionDTO {
  return {
    id,
    emoji,
    messageId: 'message-1',
    timestamp: '2026-01-01T00:00:00Z',
    user: { id: `uid-${username}`, username, publicKey: {}, groups: [] },
  };
}

describe('ReactionGroupingPipe', () => {
  let pipe: ReactionGroupingPipe;

  beforeEach(() => {
    pipe = new ReactionGroupingPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty list for empty input', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('creates one group for a single reaction', () => {
    const r = reaction('1', '👍');
    expect(pipe.transform([r])).toEqual([{ emoji: '👍', reactions: [r] }]);
  });

  it('groups reactions with the same emoji', () => {
    const a = reaction('1', '👍');
    const b = reaction('2', '❤');
    const c = reaction('3', '👍');
    const d = reaction('4', '😂');
    const e = reaction('5', '❤');

    const groups = pipe.transform([a, b, c, d, e]);

    expect(groups).toEqual([
      { emoji: '👍', reactions: [a, c] },
      { emoji: '❤', reactions: [b, e] },
      { emoji: '😂', reactions: [d] },
    ]);
  });

  it('orders groups by first occurrence and keeps reaction order within a group', () => {
    const a = reaction('1', '🎉');
    const b = reaction('2', '👍');
    const c = reaction('3', '👍');
    const d = reaction('4', '🎉');

    const groups = pipe.transform([a, b, c, d]);

    expect(groups.map((g) => g.emoji)).toEqual(['🎉', '👍']);
    expect(groups[0].reactions.map((r) => r.id)).toEqual(['1', '4']);
    expect(groups[1].reactions.map((r) => r.id)).toEqual(['2', '3']);
  });

  it('keeps skin tone variants in separate groups', () => {
    const plain = reaction('1', '👍');
    const toned = reaction('2', '👍🏽');

    const groups = pipe.transform([plain, toned]);

    expect(groups.map((g) => g.emoji)).toEqual(['👍', '👍🏽']);
  });

  it('does not mutate the input array', () => {
    const input = [reaction('1', '👍'), reaction('2', '❤'), reaction('3', '👍')];
    const copy = [...input];

    pipe.transform(input);

    expect(input).toEqual(copy);
  });
});
