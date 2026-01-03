import {inject, Pipe, PipeTransform} from '@angular/core';
import {CryptoService} from '../services/crypto-service';
import {KeyId} from '../services/websocket/WebSocketServerConnection';

@Pipe({
  name: 'keyID'
})
export class KeyIDPipe implements PipeTransform {

  private cryptoService =inject(CryptoService);

  transform(value: CryptoKeyPair,): Promise<KeyId> {
    return this.cryptoService.generateKeyId(value.publicKey);
  }

}
