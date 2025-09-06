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
type ServerObjectId = Brand<string, "ServerObjectId">;
// The ID of a key
type KeyId = Brand<string, "KeyId">;

export interface AuthChallenge {
  challenge: string;
  validUntil: string;
}

export enum EventType {
  AuthChallengeRequest = "AuthChallengeRequest",
  AuthChallengeResponse = "AuthChallengeResponse",
  AuthSuccessEvent = "AuthSuccessEvent",

  ClientChannelChangeRequest = "ClientChannelChangeRequest",
  ClientChannelChangeEvent = "ClientChannelChangeEvent",

  ServerTreeChangeEvent = "ServerTreeChangeEvent"
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

export interface ClientChannelChangeEvent extends EventBody<EventType.ClientChannelChangeEvent> {
  channelIdFrom: ServerObjectId;
  channelIdTo: ServerObjectId;

  user: UserReference;
}
