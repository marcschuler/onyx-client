import {ChannelDTO, SectionDTO, ServerTreeChangeMessage} from '../../api/webrtc-server';

export function getChannelFromId(id: string, sections: SectionDTO[]): ChannelDTO | undefined {
  for (const s of sections) {
    for (const c of (s.channels || [])) {
      if (c.id === id) {
        return c;
      }
    }
  }
  return undefined;
}
