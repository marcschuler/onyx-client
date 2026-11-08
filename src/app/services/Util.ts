import {version} from '../../../package.json'
import {Client, KeyId} from './websocket/WebSocketServerConnection';

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

export interface GridLayout {
  cols: number;
  rows: number;
  tileWidth: number; // in px
  tileHeight: number; // in px
  scroll: boolean; // true if the tiles don't fit into the container height (because of minTileWidth)
}

/**
 * Smallest useful tile: names, controls and faces are still readable at 240x135
 */
export const MIN_TILE_WIDTH = 240;

/**
 * Finds the column count that gives the largest tiles of the given aspect ratio
 * for `count` tiles in a `width` x `height` container.
 * If the tiles would get smaller than `minTileWidth`, the tiles keep that width,
 * fill the container width and `scroll` is set (the container has to scroll vertically).
 * @param count the number of tiles
 * @param width the container width in px
 * @param height the container height in px
 * @param aspect the aspect ratio of a tile (width / height)
 * @param gap the gap between tiles in px
 * @param minTileWidth the minimum tile width in px (0 = no minimum)
 */
export function bestGridLayout(count: number, width: number, height: number,
                               aspect = 16 / 9, gap = 8, minTileWidth = 0): GridLayout {
  let best: GridLayout = {cols: 1, rows: 1, tileWidth: 0, tileHeight: 0, scroll: false};
  if (count === 0 || width <= 0 || height <= 0)
    return best;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const maxWidth = (width - gap * (cols - 1)) / cols;
    const maxHeight = (height - gap * (rows - 1)) / rows;
    const tileWidth = Math.floor(Math.min(maxWidth, maxHeight * aspect)); // floor: avoid wrapping by rounding
    if (tileWidth > best.tileWidth)
      best = {cols, rows, tileWidth, tileHeight: Math.floor(tileWidth / aspect), scroll: false};
  }
  if (best.tileWidth >= minTileWidth)
    return best;

  // too small: as many columns of at least minTileWidth as fit, the rest scrolls
  const cols = Math.max(1, Math.min(count, Math.floor((width + gap) / (minTileWidth + gap))));
  const rows = Math.ceil(count / cols);
  const tileWidth = Math.min(Math.floor((width - gap * (cols - 1)) / cols), Math.floor(width));
  const tileHeight = Math.floor(tileWidth / aspect);
  return {cols, rows, tileWidth, tileHeight, scroll: rows * tileHeight + gap * (rows - 1) > height};
}

export function isElectron() {
  return navigator.userAgent.toLowerCase().includes('electron');
}

export const APP_VERSION = version;
