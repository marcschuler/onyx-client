export function getMediaTracker(){
  return new BrowserMediaTracker();
}

export interface MediaTracker {
  openTrack(type: TrackType): Promise<MediaStream>;
}

export class BrowserMediaTracker implements MediaTracker {
  openTrack(type: TrackType): Promise<MediaStream> {
    switch (type) {
      case TrackType.Microphone:
        return navigator.mediaDevices.getUserMedia({audio: true})
      case TrackType.Camera:
        return navigator.mediaDevices.getUserMedia({video: true})
      case TrackType.Screen:
        return navigator.mediaDevices.getDisplayMedia({video: true})
    }
  }
}

//TODO
export class ElectronMediaTracker implements MediaTracker{
  openTrack(type: TrackType): Promise<MediaStream> {
    return (Promise.resolve(undefined) as any);
  }

}

// The three track types
export enum TrackType {
  Microphone = "Microphone",
  Camera = "Camera",
  Screen = "Screen"
}
