import {SectionDTO} from '../../api/webrtc-server/model/sectionDTO';
import {ChannelDTO} from '../../api/webrtc-server/model/channelDTO';

import {version} from '../../../package.json'

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


/**
 * Finds a free name that is either "baseName" or "baseName 1", "baseName 2", etc...
 * @param baseName the base nanme
 * @param namesTaken a list of taken names
 */
export function findFreeName(baseName: string, namesTaken: string[]){
  let name = baseName;
  let index = 1;
  while(namesTaken.filter(n => n == name).length>0){
    name = baseName + " " + index;
    index++;
  }
  return name;
}

export const APP_VERSION = version;
