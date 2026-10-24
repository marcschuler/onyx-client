import {
  LucideFile,
  LucideFileArchive,
  LucideFileBracesCorner,
  LucideFileHeadphone,
  LucideFileImage,
  LucideFileText,
  LucideFileVideoCamera,
  LucideIcon
} from '@lucide/angular';


const TYPES_TEXT = ['application/json',
  'text/javascript',
  'text/plain']

export function fileMimetypeToIcon(mimeType: string): LucideIcon {

  switch (mimeTypeToFileType(mimeType)) {
    case FileType.VIDEO:
      return LucideFileVideoCamera;
    case FileType.IMAGE:
      return LucideFileImage;
    case FileType.AUDIO:
      return LucideFileHeadphone;
    case FileType.PDF:
      return LucideFileText;
    case FileType.TEXT:
      return LucideFileBracesCorner;

  }

  if (mimeType == "application/zip")
    return LucideFileArchive;

  console.warn("Could not find icon for mimetype " + mimeType + " - defaulting icon")
  return LucideFile;
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

export function mimeTypeHasImagePreview(mimeType: string){
  return mimeTypeToFileType(mimeType) ===  FileType.IMAGE;
}

export enum FileType {
  TEXT,
  IMAGE,
  VIDEO,
  AUDIO,
  PDF,
}
