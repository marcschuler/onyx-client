import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {ServerDTO} from '../../api/onyx-server';
import {ListStore} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ServerLoaderService {
  private httpClient = inject(HttpClient);

  public connections = new ListStore<ServerDetails>('serverConnections');

  public serverDetails(connection: ServerDetails): Promise<ServerDTO[]> {
    // @ts-expect-error somehow expects "undefined"
    return this.httpClient.get<ServerDTO[]>(connection.url + "/v0/info/server").pipe(
      catchError(err => {
        // Wrap into custom error object
        return throwError(() => new Error(`Custom error: ${err.message || err.statusText}`));
      })
    ).toPromise();
  }
}


export interface ServerDetails {
  id: string;
  url: string;
  name?: string;
  password?: string;
}
