import {TestBed} from '@angular/core/testing';

import {CryptoService} from './crypto-service';
import {Identity, IdentityService} from './identity-service';

describe('CryptoService', async () => {
  let service: CryptoService;

  const keyPair: CryptoKeyPair = await crypto.subtle.generateKey(
    "Ed25519",
    true,
    ["sign", "verify"]
  );
  const identity: Identity = {
    username: "",
    keyPair: keyPair,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('signing and verifying (simple)', async () => {
    const data = {key: "value"}
    const signedContent = await service.sign(data, identity);
    const verified = await service.verify(signedContent, keyPair.publicKey);
    expect(verified).toBeTruthy();
  })

  it('key id (equals what the server calculates!)', async () => {
    var publickey1 = "{\"kty\":\"OKP\",\"crv\":\"Ed25519\",\"kid\":\"my-key-id\",\"x\":\"UnoNfkJaqpUkMZq0bGgooM7Ip_8ZgoWsLONqItsgK-M\"}";
    var key = await crypto.subtle.importKey("jwk", JSON.parse(publickey1) as JsonWebKey, "Ed25519", true, ["verify"]);
    expect(await service.generateKeyId(key)).toBe("i2lMeB/Sw94WvkLiAccs9/HE7g2RMazoqKl0hqSeW+k=");
  })
});
