import {FileBracesCornerIcon, FileIcon, FileImageIcon, FileTextIcon, LucideIconData} from 'lucide-angular';

export function fileMimetypeToIcon(mimeType: string):LucideIconData {
    switch (mimeType) {
      case 'application/json':
        return FileBracesCornerIcon;
      case 'application/pdf':
        return FileTextIcon;
      case 'image/png':
      case 'image/jpeg':
        return FileImageIcon;
      default:
        console.warn("Could not find icon for mimetype " + mimeType + " - defaulting icon")
        return FileIcon;
    }
  }
