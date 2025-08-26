import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerLoaderService {

  public connections: ServerConnection[] = [];

  constructor() {
    this.loadServer();
  }

  private loadServer() {
    var storedConnections = localStorage.getItem("serverConnections");
    if (storedConnections)
      this.connections = (JSON.parse(storedConnections) as ServerConnection[]);
  }

  public addServer(server:ServerConnection){
    this.connections.push(server);
    this.saveServer()
  }

  private saveServer() {
    localStorage.setItem("serverConnections", JSON.stringify(this.connections));
  }

  public serverDetails(connection:ServerConnection):Promise<ServerDetail>{
    return Promise.reject({error:"Connection not implemented"}as ServerDetailError)
  }


}


export interface ServerConnection {
  url: string;
}

export interface ServerDetail{
  userCount: number;
  pingMs: number;
  slogan: string;
}

export interface ServerDetailError {
  error: string;
}
