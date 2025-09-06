import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto-service';
import {Identity, IdentityService} from './identity-service';

describe('CryptoService', async () => {
  let service: CryptoService;

  const keyPair: CryptoKeyPair = await crypto.subtle.generateKey(
    "Ed25519",
    true,
    ["sign", "verify"]
  );
  const identity: Identity={
    username:"",
    keyPair: keyPair,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('signing and verifying (simple)',async ()=>{
    const data = {key:"value"}
    const signedContent =await  service.sign(data,identity);
    const verified = await service.verify(signedContent,keyPair.publicKey);
    expect(verified).toBeTruthy();
  })
});
