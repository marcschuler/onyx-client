import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {

  private IDENTITY_STORE_KEY="identities";

  identities: Identity[] = [];

  constructor(private router: Router) {
    this.loadIdentities().then(() => {
      console.log("Loaded " + this.identities.length + " identities");
      if (this.identities.length == 0) {
        console.log("No identity found - requesting user to create one");
        this.router.navigate(['/settings/identity/new'])
      }
    })
  }

  async create(username: string) {
    const keyPair: CryptoKeyPair = await crypto.subtle.generateKey(
      "Ed25519",
      true,
      ["sign", "verify"]
    );
    const identity: Identity = {
      username: username,
      keyPair: keyPair
    }
    this.identities.push(identity);
    await this.saveIdentities();
    return identity;
  }

  private async loadIdentities() {
    console.log("Loading identities")
    const storedIdentities = localStorage.getItem(this.IDENTITY_STORE_KEY);
    if (!storedIdentities)
      return;
    const stored = (JSON.parse(storedIdentities) as StoredIdentity[]);
    for (const i of stored) {
      try {
        const privateKey = await crypto.subtle.importKey("jwk", i.privateKey, "Ed25519", true, ["sign"]);
        const publicKey = await crypto.subtle.importKey("jwk", i.publicKey, "Ed25519", true, ["verify"]);
        this.identities.push({
          username: i.username,
          keyPair: {privateKey: privateKey, publicKey: publicKey}
        });
      }catch (e) {
        console.error("Could not load identity " + JSON.stringify(i)+ "," + e)
      }
    }
  }

  private async saveIdentities() {
    const stored: StoredIdentity[] = [];
    for (const i of this.identities) {
      stored.push({
        username: i.username,
        publicKey: await crypto.subtle.exportKey("jwk", i.keyPair.publicKey),
        privateKey: await crypto.subtle.exportKey("jwk", i.keyPair.privateKey)
      } as StoredIdentity);
    }
    console.log(stored)
    localStorage.setItem(this.IDENTITY_STORE_KEY, JSON.stringify(stored));
  }

  defaultIdentity() {
    const identity = this.identities[0]; //TODO Could be reworked in the future - maybe last used identity?
    if (identity == undefined)
      console.warn("No default identity found - but requested");
    return identity;
  }
}


export interface Identity {
  username: string;
  keyPair: CryptoKeyPair;
}

export interface StoredIdentity {
  username: string;
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}
