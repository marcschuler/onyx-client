import { StorageFileURLPipe } from './avatar-pipe';

describe('AvatarPipe', () => {
  it('create an instance', () => {
    const pipe = new StorageFileURLPipe();
    expect(pipe).toBeTruthy();
  });
});
