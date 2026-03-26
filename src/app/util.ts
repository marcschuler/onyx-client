export function removeItemFromList<T>(list:T[], item: T){
  const index = list.findIndex(item => item=== item)
  if (index > -1)
    throw "Item does not exist";
  return list.splice(index, 1)
}

export function replaceInList<T>(list:T[], existingItem: T, replacement: T){
  const index = list.indexOf(existingItem);
  if (index !== -1) {
    list.splice(index, 1, replacement);
  }
  return list;
}
