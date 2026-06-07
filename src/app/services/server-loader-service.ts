import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {ServerDTO} from '../../api/webrtc-server';

@Injectable({
  providedIn: 'root'
})
export class ServerLoaderService {
  private httpClient = inject(HttpClient);


  public connections: ServerConnection[] = [];

  constructor() {
    this.loadServer();
  }

  private loadServer() {
    const storedConnections = localStorage.getItem("serverConnections");
    if (storedConnections)
      this.connections = (JSON.parse(storedConnections) as ServerConnection[]);
  }

  public addServer(server: ServerConnection) {
    this.connections.push(server);
    this.saveServer()
  }

  removeServer(s: ServerConnection) {
    const index = this.connections.indexOf(s);
    this.connections.splice(index,1);
    this.saveServer();
  }

  public saveServer() {
    localStorage.setItem("serverConnections", JSON.stringify(this.connections));
  }

  public serverDetails(connection: ServerConnection): Promise<ServerDTO[]> {
    // @ts-expect-error somehow expects "undefined"
    return this.httpClient.get<ServerDTO[]>(connection.url + "/v0/info/server").pipe(
      catchError(err => {
        // Wrap into custom error object
        return throwError(() => new Error(`Custom error: ${err.message || err.statusText}`));
      })
    ).toPromise();
  }
}


export interface ServerConnection {
  id: string;
  url: string;
  name?: string;
}
