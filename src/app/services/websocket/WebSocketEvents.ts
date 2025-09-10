import {SignedContent} from "../crypto-service";
import {ServerTree} from "./WebSocketServerConnection";

/**
 * GENERAL
 */
export interface EventBody<T extends EventType> {
  type: T;
}


type Brand<K, T> = K & { __brand: T };

// The ID all server objects use, may be a UUID
export type ServerObjectId = Brand<string, "ServerObjectId">;
// The ID of a key
export type KeyId = Brand<string, "KeyId">;

export interface AuthChallenge {
  challenge: string;
  validUntil: string;
}

export enum EventType {
  AuthChallengeRequest = "AuthChallengeRequest",
  AuthChallengeResponse = "AuthChallengeResponse",
  AuthSuccessEvent = "AuthSuccessEvent",

  ClientChannelChangeRequest = "ClientChannelChangeRequest",
  ClientChannelJoinEvent = "ClientChannelJoinEvent",
  ClientChannelLeaveEvent = "ClientChannelLeaveEvent",

  ServerTreeChangeEvent = "ServerTreeChangeEvent",

  PeerOffer = "PeerOffer",
  PeerOfferForward = "PeerOfferForward",
  PeerAnswer = "PeerAnswer",
  PeerAnswerForward = "PeerAnswerForward"
}

export interface UserReference {
  id: KeyId;
  publicKey: JsonWebKey,
  username: string;
}


/**
 * AUTH
 */
export interface AuthChallengeRequest extends EventBody<EventType.AuthChallengeRequest> {
  challenge: AuthChallenge;
}

export interface AuthChallengeResponse extends EventBody<EventType.AuthChallengeResponse> {
  publicKey: string;
  username: string;
  challenge: SignedContent;
}

export interface AuthSuccessEvent extends EventBody<EventType.AuthSuccessEvent> {

}

export interface ServerTreeChangeEvent extends EventBody<EventType.ServerTreeChangeEvent>, ServerTree {

}

/**
 * CHANNEL
 */
export interface ClientChannelChangeRequest extends EventBody<EventType.ClientChannelChangeRequest> {
  channelId: ServerObjectId;
}

export interface ClientChannelJoinEvent extends EventBody<EventType.ClientChannelJoinEvent> {
  user: UserReference;
  channelId: ServerObjectId;
}

export interface ClientChannelLeaveEvent extends EventBody<EventType.ClientChannelLeaveEvent> {
  user: UserReference;
}

/**
 * Peer
 */

export interface PeerOffer extends EventBody<EventType.PeerOffer> {
  clientTo: KeyId;
  offer: any;
}

export interface PeerOfferForward extends EventBody<EventType.PeerOfferForward> {
  clientFrom: KeyId;
  offer: any;
}

export interface PeerAnswer extends EventBody<EventType.PeerAnswer> {
  clientTo: KeyId;
  answer: any;
}

export interface PeerAnswerForward extends EventBody<EventType.PeerAnswerForward> {
  clientFrom: KeyId;
  answer: any;
}

