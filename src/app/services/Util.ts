import {SectionDTO} from '../../api/webrtc-server/model/sectionDTO';
import {ChannelDTO} from '../../api/webrtc-server/model/channelDTO';

import {version} from '../../../package.json'
import {Client, KeyId, WebSocketServerConnection} from './websocket/WebSocketServerConnection';
import {SectionExtendedDTO} from '../../api/webrtc-server';

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

export function getSectionOfChannel(channel: ChannelDTO, sections: SectionDTO[]): SectionDTO | undefined {
  for (const s of sections) {
    for (const c of (s.channels || [])) {
      if (c.id === channel.id) {
        return s;
      }
    }
  }
  return undefined;
}

export function getSectionFromId<T extends SectionDTO | SectionExtendedDTO>(id: string, sections: T[]) {
  for (const s of sections) {
    if (s.id === id)
      return s;
  }
  return undefined;
}

export function compareLists<T>(left: T[], right: T[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  return {
    missingFromLeft: right.filter(item => !leftSet.has(item)),
    missingFromRight: left.filter(item => !rightSet.has(item))
  };
}

/**
 * Reorders an item from one list to another
 * @param sourceList the source list
 * @param item the item
 * @param newIndex the new index at the target list1
 * @param targetList the target list. Can be the same as the source list if simple reordering is wanted
 */
export function reorderListItem<T>(sourceList: T[], item: T, newIndex: number, targetList: T[] = sourceList): void {
  const currentIndex = sourceList.indexOf(item);
  sourceList.splice(currentIndex, 1);
  targetList.splice(newIndex, 0, item);
}

/**
 * Replaces an element in a list
 * @param list the list
 * @param oldElement the old element
 * @param newElement the new element
 */
export function replaceInList<T>(list: T[], oldElement: T, newElement: T) {
  const index = list.indexOf(oldElement);
  if (index == -1)
    throw new Error("Element is not in list, cannot replace");
  list[index] = newElement;
}

export function deleteInList<T>(list: T[], oldElement: T) {
  const index = list.indexOf(oldElement);
  if (index == -1)
    throw new Error("Element is not in list, cannot delete");
  list.splice(index, 1);
}


export function clientsInChannel(clients: Client[], channelId: KeyId | string | undefined) {
  return clients
    .filter(c => c.id == channelId);
}

export function clientWithId(clients: Client[], clientId: string) {
  return clients.filter(c => c.id == clientId)[0];
}


/**
 * Finds a free name that is either "baseName" or "baseName 1", "baseName 2", etc...
 * @param baseName the base nanme
 * @param namesTaken a list of taken names
 */
export function findFreeName(baseName: string, namesTaken: string[]) {
  let name = baseName;
  let index = 1;
  while (namesTaken.filter(n => n == name).length > 0) {
    name = baseName + " " + index;
    index++;
  }
  return name;
}

export function isElectron() {
  return navigator.userAgent.toLowerCase().includes('electron');
}

export const APP_VERSION = version;
