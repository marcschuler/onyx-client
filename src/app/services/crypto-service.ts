import {Injectable} from '@angular/core';
import {Identity} from './identity-service';
import {KeyId} from './websocket/WebSocketServerConnection';
import * as jose from 'jose'
import {calculateJwkThumbprint} from 'jose';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  async sign<T>(content: T, identity: Identity): Promise<SignedContent> {
    const jsonString = this.toJson(content);
    const encoded = new TextEncoder().encode(jsonString);
    const jws = await new jose.CompactSign(encoded).setProtectedHeader({alg: 'EdDSA'}).sign(identity.keyPair.privateKey);

    return {
      jws: jws
    }
  }

  async verify<T>(signedContent: SignedContent, publicKey: CryptoKey) {
    const { payload, protectedHeader } = await jose.compactVerify(signedContent.jws, publicKey);
    return payload;
  }

  public async generateKeyId(publicKey:CryptoKey):Promise<KeyId> {
    return await calculateJwkThumbprint(publicKey,"sha256") as KeyId;
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

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

}

/**
 * A signed content wrapper.
 * The content is a stringified json object.
 * The signature is the signature of that string representation.
 */
export interface SignedContent{
  jws: string;
}
