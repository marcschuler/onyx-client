export function removeItemFromList<T>(list: T[], item: T) {
  const index = list.findIndex(i => i === item)
  if (index > -1)
    throw "Item does not exist";
  return list.splice(index, 1)
}

export function replaceInList<T>(list: T[], existingItem: T, replacement: T) {
  const index = list.indexOf(existingItem);
  if (index !== -1) {
    list.splice(index, 1, replacement);
  }
  return list;
}

export function moveUpInList<T>(list: T[], index: number): void {
  if (index === 0) return;
  [list[index - 1], list[index]] = [list[index], list[index - 1]];
}

export function moveDownInList<T>(list: T[], index: number): void {
  if (index === list.length - 1) return;
  [list[index + 1], list[index]] = [list[index], list[index + 1]];
}
