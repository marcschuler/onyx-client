import {SectionDTO} from '../../api/webrtc-server/model/sectionDTO';
import {ChannelDTO} from '../../api/webrtc-server/model/channelDTO';

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

export function compareLists<T>(left:T[], right:T[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  return {
    missingFromLeft: right.filter(item => !leftSet.has(item)),
    missingFromRight: left.filter(item => !rightSet.has(item))
  };
}

