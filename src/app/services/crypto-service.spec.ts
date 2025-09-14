import {TestBed} from '@angular/core/testing';

import {CryptoService} from './crypto-service';
import {Identity, IdentityService} from './identity-service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CryptoService', () => {
  let service: CryptoService;

  let keyPair!: CryptoKeyPair ;
  let identity!: Identity;

  beforeEach(async () => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(CryptoService);
    keyPair =await crypto.subtle.generateKey(
      "Ed25519",
      true,
      ["sign", "verify"]
    );
    identity = {
      id: await service.generateKeyId(keyPair.publicKey),
      username: "",
      keyPair: keyPair,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('signing and verifying (simple)', async () => {
    const data = {key: "value"}
    const signedContent = await service.sign(data, identity);
    const verified = await service.verify(signedContent, keyPair.publicKey);

    console.log(identity.keyPair)
    console.log(await service.exportKey(identity.keyPair.privateKey));
    console.log(signedContent);
    expect(verified).toBeTruthy();
  })

  it('key id (equals what the server calculates!)', async () => {
    const publickey1 = "{\"kty\":\"OKP\",\"crv\":\"Ed25519\",\"kid\":\"my-key-id\",\"x\":\"UnoNfkJaqpUkMZq0bGgooM7Ip_8ZgoWsLONqItsgK-M\"}";
    const key = await crypto.subtle.importKey("jwk", JSON.parse(publickey1) as JsonWebKey, "Ed25519", true, ["verify"]);
    expect(await service.generateKeyId(key)).toBe("i2lMeB/Sw94WvkLiAccs9/HE7g2RMazoqKl0hqSeW+k=");
  })

  it('base64-converter',()=>{
    const str = "YWJjZGVm";
    var buffer = service.base64ToArrayBuffer(str);
    var base64 = service.arrayBufferToBase64(buffer);
    expect(base64).toBe(str);
  })
});
