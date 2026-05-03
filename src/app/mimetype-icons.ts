import {
  FileBracesCornerIcon, FileHeadphoneIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoCameraIcon,
  LucideIconData
} from 'lucide-angular';


const TYPES_TEXT = ['application/json',
  'text/javascript',
  'text/plain']

export function fileMimetypeToIcon(mimeType: string): LucideIconData {
  if (mimeType == "application/pdf")

  switch (mimeTypeToFileType(mimeType)){
    case FileType.VIDEO:
      return FileVideoCameraIcon;
    case FileType.IMAGE:
      return FileImageIcon;
    case FileType.AUDIO:
      return FileHeadphoneIcon;
    case FileType.PDF:
      return FileTextIcon;
    case FileType.TEXT:
      return FileBracesCornerIcon;

  }

  console.warn("Could not find icon for mimetype " + mimeType + " - defaulting icon")
  return FileIcon;
}

export function mimeTypeToFileType(mimeType: string): FileType | undefined {
  if (mimeType.startsWith("text/"))
    return FileType.TEXT;

  if (mimeType.startsWith("image/"))
    return FileType.IMAGE

  if (mimeType.startsWith("video/"))
    return FileType.VIDEO;

  if (mimeType.startsWith("audio/") || mimeType == "application/ogg")
    return FileType.AUDIO;

  if (mimeType == "application/pdf")
    return FileType.PDF;

  //console.warn("Could not find icon for mimetype " + mimeType + " - defaulting icon")
  return undefined;
}

export enum FileType {
  TEXT,
  IMAGE,
  VIDEO,
  AUDIO,
  PDF,
}
