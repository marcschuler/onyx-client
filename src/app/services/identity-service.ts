import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {

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
    const storedIdentities = localStorage.getItem('identities');
    if (!storedIdentities)
      return;
    const stored = (JSON.parse(storedIdentities) as StoredIdentity[]);
    for (const i of stored) {
      const privateKey = await crypto.subtle.importKey("jwk", i.privateKey, "Ed25519", true, ["sign", "verify"]);
      const publicKey = await crypto.subtle.importKey("jwk", i.publicKey, "Ed25519", true, ["sign", "verify"]);
      this.identities.push({
        username: i.username,
        keyPair: {privateKey: privateKey, publicKey: publicKey}
      });
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
    localStorage.setItem('identities', JSON.stringify(stored));
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
