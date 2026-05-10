import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, firstValueFrom, throwError} from 'rxjs';
import {ServerDTO} from '../../api/webrtc-server';

@Injectable({
  providedIn: 'root'
})
export class ServerLoaderService {

  public connections: ServerConnection[] = [];

  constructor(private httpClient: HttpClient) {
    this.loadServer();
  }

  private loadServer() {
    var storedConnections = localStorage.getItem("serverConnections");
    if (storedConnections)
      this.connections = (JSON.parse(storedConnections) as ServerConnection[]);
  }

  public addServer(server: ServerConnection) {
    this.connections.push(server);
    this.saveServer()
  }

  removeServer(s: ServerConnection) {
    var index = this.connections.indexOf(s);
    this.connections.splice(index,1);
    this.saveServer();
  }

  public saveServer() {
    localStorage.setItem("serverConnections", JSON.stringify(this.connections));
  }

  public serverDetails(connection: ServerConnection): Promise<ServerDTO[]> {
    // @ts-ignore
    return this.httpClient.get<ServerDTO[]>(connection.url + "/v0/info/server").pipe(
      catchError(err => {
        // Wrap into custom error object
        return throwError(() => new Error(`Custom error: ${err.message || err.statusText}`));
      })
    ).toPromise();
  }
}


export interface ServerConnection {
  url: string;
  name?: string;
}
