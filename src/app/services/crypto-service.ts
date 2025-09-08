import {Injectable} from '@angular/core';
import {Identity} from './identity-service';
import {KeyId} from './websocket/WebSocketEvents';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  async sign<T>(content: T, identity: Identity): Promise<SignedContent> {
    const jsonString = this.toJson(content);
    const encoded = new TextEncoder().encode(jsonString).buffer;
    const signature = await window.crypto.subtle.sign("Ed25519",
      identity.keyPair.privateKey,
      encoded);
    const signatureBase64 = this.arrayBufferToBase64(signature);
    return {
      content: jsonString,
      contentSignature: signatureBase64
    }
  }

  async verify<T>(signedContent: SignedContent, publicKey: CryptoKey) {
    const encodedContent = new TextEncoder().encode(signedContent.content).buffer;
    const encodedSignature = new TextEncoder().encode(atob(signedContent.contentSignature)).buffer;
    const result = await window.crypto.subtle.verify("Ed25519", publicKey, encodedSignature, encodedContent);
    return result;
  }

  public async generateKeyId(publicKey:CryptoKey):Promise<KeyId> {
    const spki = await crypto.subtle.exportKey('spki', publicKey);
    const digest = await crypto.subtle.digest('SHA-256', spki);
    return btoa(String.fromCharCode(...new Uint8Array(digest))) as KeyId;
  }


  async exportKey(key:CryptoKey) {
    return await crypto.subtle.exportKey("jwk", key);
  }

  toJson<T>(content: T): string {
    return JSON.stringify(content); //TODO
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

}

/**
 * A signed content wrapper.
 * The content is a stringified json object.
 * The signature is the signature of that string representation.
 */
export interface SignedContent{
  content: string;
  contentSignature: string;
}
