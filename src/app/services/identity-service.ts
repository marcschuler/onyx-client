import { Injectable, inject } from '@angular/core';
import {Router} from '@angular/router';
import {CryptoService} from './crypto-service';
import {ToastService, ToastType} from './toast-service';
import {KeyId} from './websocket/WebSocketServerConnection';
import {CryptoKey, generateKeyPair, GenerateKeyPairResult, importJWK} from 'jose';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private router = inject(Router);
  private cryptoService = inject(CryptoService);
  private toastService = inject(ToastService);


  private IDENTITY_STORE_KEY = "identities";

  identities: Identity[] = [];

  constructor() {
    this.loadIdentities().then(() => {
      console.log("Loaded " + this.identities.length + " identities");
      if (this.identities.length == 0) {
        console.log("No identity found - requesting user to create one");
        this.router.navigate(['/welcome'])
      }
    })
  }

  async create(username: string, keyPair: GenerateKeyPairResult | undefined = undefined): Promise<Identity> {
    if (!keyPair)
      keyPair = await this.generateKey();
    const identity: Identity = {
      id: await this.cryptoService.generateKeyId(keyPair.publicKey),
      username: username,
      keyPair: keyPair,
      created: new Date()
    }
    this.identities.push(identity);
    await this.saveIdentities();
    return identity;
  }

  public async generateKey() {
   return await generateKeyPair('EdDSA', {
      crv: 'Ed25519',
      extractable: true
    });
  }

  private async loadIdentities() {
    console.log("Loading identities")
    const storedIdentities = localStorage.getItem(this.IDENTITY_STORE_KEY);
    if (!storedIdentities)
      return;
    const stored = (JSON.parse(storedIdentities) as StoredIdentity[]);
    for (const i of stored) {
      try {
        const publicKey = await importJWK(i.publicKey, "Ed25519") as CryptoKey;
        const privateKey = await importJWK(i.privateKey, "Ed25519") as CryptoKey;
        const identity = {
          id: await this.cryptoService.generateKeyId(publicKey),
          username: i.username,
          keyPair: {privateKey: privateKey, publicKey: publicKey},
          created: new Date(i.created)
        };
        this.identities.push(identity);
        console.log("loaded identity " + identity.username + " ( " + identity.id + ")")
      } catch (e) {
        console.error("Could not load identity " + JSON.stringify(i) + "," + e)
        this.toastService.create({
          type: ToastType.Error,
          title: "Could not load identity " + i.username,
          message: JSON.stringify(e),
          duration: 3000
        })
      }

    }
  }

  private async saveIdentities() {
    const stored: StoredIdentity[] = [];
    for (const i of this.identities) {
      stored.push({
        username: i.username,
        publicKey: await crypto.subtle.exportKey("jwk", i.keyPair.publicKey),
        privateKey: await crypto.subtle.exportKey("jwk", i.keyPair.privateKey),
        created: i.created.getTime()
      } as StoredIdentity);
    }
    localStorage.setItem(this.IDENTITY_STORE_KEY, JSON.stringify(stored));
    console.log("Saved new list of identites")
  }

  defaultIdentity() {
    const identity = this.identities[0]; //TODO Could be reworked in the future - maybe last used identity?
    if (identity == undefined)
      console.warn("No default identity found - but requested");
    return identity;
  }

  delete(identity: Identity) {
    const index = this.identities.indexOf(identity);
    if (index !== -1) {
      this.identities.splice(index, 1);
      this.saveIdentities();
    } else {
      throw new Error("Identity is not in known list");
    }
  }
}


export interface Identity {
  id: KeyId;
  username: string;
  keyPair: { privateKey: CryptoKey, publicKey: CryptoKey };
  created: Date;
}

export interface StoredIdentity {
  username: string;
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
  created: number;
}
