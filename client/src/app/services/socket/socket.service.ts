import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from "socket.io-client";

@Injectable()
export class SocketService {
	private host: string = "http://localhost:8080";
	private socket: any;
  last_emit: string;
  last_data_emit: any;

  constructor() {
    this.socket = io(this.host);
    this.socket.on("connect", () => this.connected());
    this.socket.on("disconnect", () => this.disconnected());
    this.socket.on("error", (error: string) => {
        console.log(`ERROR: "${error}" (${this.host})`);
    });
    this.connect();
  }

  connect () {
	  this.socket.connect();
  }
  disconnect () {
    this.socket.disconnect();
  }  

  emit(chanel, message) {
      if (chanel != 'tokenRefresh') {
        this.last_emit = chanel;
        this.last_data_emit = message;
      }
      return new Observable<any>(observer => {
          console.log(`emit to ${chanel}:`,message);
          this.socket.emit(chanel, message, function (data) {
              if (data.success) {
                  observer.next(data.msg);
              } else {
                  observer.error(data.msg);
              }
              observer.complete();
          });
      });
  }

  on(event_name: string): Observable<any> {
      console.log(`listen to ${event_name}:`);

      return new Observable<any>((observer) => {
          this.socket.off(event_name);
          this.socket.on(event_name, (data) => {
              observer.next(data);
          });
      });
  }


  private connected() {
      console.log('Connected');
  }
  private disconnected() {
      console.log('Disconnected');
  }  
}