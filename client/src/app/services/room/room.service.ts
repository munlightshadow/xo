import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketService } from './../socket/socket.service';


@Injectable()
export class RoomService {
  private subject = new Subject<any>();
  gameId: any;
  mySocketId: any;


  constructor(
    private socket: SocketService,
    private router: Router
  ) {
   /*
    this.socket.on('validLogOut').subscribe((data) => {
      console.log('on: validLogOut');

      this.token = "";
      this.token_refresh = "";
      this.login = "";

      console.log('Logout user');
      this.subject.next(this.login);

      this.router.navigate(['/']);    
    });
    */
  }
/*
  getUserSubscription(): Observable<any> {
      return this.subject.asObservable();
  }

  loginUser(token, token_refresh, login) {
    this.token = token;
    this.token_refresh = token_refresh;
    this.login = login;
    console.log('Login user:', login);
    this.subject.next(login);

    this.router.navigate(['/']);    
  }    

  logoutUser() {
    this.socket.emit('userLogOut', {token : this.token}).subscribe();
  }      
  */
}