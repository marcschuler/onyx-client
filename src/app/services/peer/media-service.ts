import {inject, Injectable, Injector} from '@angular/core';
import {PeerConnection, PeerStreams} from './PeerConnection';
import {ToastService, ToastType} from '../ui/toast-service';
import {NotificationService} from '../notification.service';

import {getMediaTracker, TrackType} from './MediaTracker';
import {PeerConnectionService} from './peer-connection-service';
import {TrackMetadataMessage} from '../../../api/webrtc-server';

@Injectable({
  providedIn: 'root',
})
export class MediaService {

  private toastService = inject(ToastService);
  private injector = inject(Injector);

  /**
   * localStream and sharedStream are synced on it's content.
   * It's preferred by the RTC library.
   * No more then the three defined TrackTypes are allowed concurrently.
   */
  localStream: PeerStreams = {
    unknownStreams: new MediaStream()
  };

  /**
   * A UI-compatible list of all three possible streams: mic, camera and screen
   * Is synced with localStream
   */
  sharedStreams: Partial<Record<TrackType, MediaStream | undefined>> = {
    [TrackType.Microphone]: undefined,
    [TrackType.Camera]: undefined,
    [TrackType.Screen]: undefined
  };


  /**
   * Switches the state of a track
   * Convenience method for our UI View to simply switch the state
   * @param type the track type
   */
  public async changeTrack(type: TrackType) {
    const media = this.sharedStreams[type];
    if (media) {
      await this.stopTrack(type);
    } else {
      await this.startTrack(type);
    }
  }


  /**
   * Starts a track of the given type
   * If the track already started, an error is displayed
   * @param type the track type
   */
  public async startTrack(type: TrackType) {
    console.log("peer: requesting track " + type)
    if (this.sharedStreams[type]) {
      console.warn("User tried to start the track " + type + " although it's already started")
      this.toastService.create({
        title: type + " is already shared",
        type: ToastType.Error,
        message: 'If the error persists, reload the page'
      });
      return;
    }


    try {
      const stream = await getMediaTracker().openTrack(type);

      this.sharedStreams[type] = stream;
      console.log("peer: activated track, adding to locals and " + this.getPeerConnectionService().peers.length + " peers")
      stream.getTracks().forEach(track => {
        this.onLocalTrackAdd(track, type);
        track.onended = () => {
          console.log("peer: track: Track has ended");
          this.onLocalTrackRemove(track, stream);
        };
      })
    } catch (e: any) {
      console.error("Could not open device", e);
      this.toastService.create({
        title: "Could not open device",
        message: ('message' in e) ? JSON.stringify(e.message) : "Unknown error",
        type: ToastType.Error,
      })
    }
  }

  private onLocalTrackAdd(track: MediaStreamTrack, type: TrackType) {
    const stream = this.addTrackForPeerStream(this.localStream, track, this.typeToLabel(type));
    this.getPeerConnectionService().addTrackToPeers(track, stream, this.typeToLabel(type));
  }

  /**
   * Removes a track and stops it
   * @param track the track
   * @param stream the local stream
   */
  onLocalTrackRemove(track: MediaStreamTrack, stream: MediaStream) {
    console.log("peer: track: removing track", track);
    this.removeTrackFromPeerStream(this.localStream, track);

    try {
      this.getPeerConnectionService().removeTrackFromPeers(track);
    }catch (e: any) {
      console.error("Could not remove track from peers", e);
    }
    track.stop(); //must be called after removing from peers
  }

  addTrackForPeerStream(peerStream: PeerStreams, track: MediaStreamTrack, label: TrackMetadataMessage.LabelEnum) {
    let stream = label === 'SCREEN' ? peerStream.screen : peerStream.cameraMic;
    console.log("peer: track: adding track to " + stream, track);
    if (!stream) {
      console.log("peer: track: creating new stream for " + label)
      stream = new MediaStream();
      if (label === 'SCREEN') {
        peerStream.screen = stream;
      } else {
        peerStream.cameraMic = stream;
      }
    }
    stream.addTrack(track);
    return stream;
  }

  removeTrackFromPeerStream(peerStream: PeerStreams, track: MediaStreamTrack) {
    if (peerStream.screen && peerStream.screen.getTrackById(track.id)) {
      peerStream.screen.removeTrack(track);
    } else if (peerStream.cameraMic && peerStream.cameraMic.getTrackById(track.id)) {
      peerStream.cameraMic.removeTrack(track);
    } else if (peerStream.unknownStreams.getTrackById(track.id)) {
      peerStream.unknownStreams.removeTrack(track);
      console.warn("peer: track: removed a stream with unknown affiliation. this may be an early connection issue or a bug");
    } else {
      console.warn("peer: track: could not find track to remove in neither screen nor cameramic", track, peerStream.screen, peerStream.cameraMic);
    }
    if (peerStream.screen && peerStream.screen.getTracks().length == 0) {
      peerStream.screen = undefined;
    }
    if (peerStream.cameraMic && peerStream.cameraMic.getTracks().length == 0) {
      peerStream.cameraMic = undefined;
    }
  }


  /**
   * Stops the given track
   * An error is displayed if the track is not running
   * @param type the type
   */
  public async stopTrack(type: TrackType) {
    console.log("peer: track: deactivating stream " + type)
    const stream = this.sharedStreams[type];
    if (!stream) {
      console.warn("peer: track: user tried to stop the track " + type + " although it's already stopped / not yet started")
      this.toastService.create({
        title: 'Cannot deactivate stream',
        message: 'The stream is not active',
        type: ToastType.Error,
      })
      return;
    }
    stream.getTracks().forEach(track => {
      this.onLocalTrackRemove(track, stream);
    });
    this.sharedStreams[type] = undefined;
  }

  private typeToLabel(type: TrackType) {
    return type == 'Screen' ? TrackMetadataMessage.LabelEnum.Screen : TrackMetadataMessage.LabelEnum.Cameramic;
  }

  // to avoid circular referencing of services
  private getPeerConnectionService() {
    return this.injector.get(PeerConnectionService);
  }


}
