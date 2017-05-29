import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketService } from './../socket/socket.service';


@Injectable()
export class UserService {
  token : string = "";
  token_refresh : string = "";
  login : string = "";
  private subject = new Subject<any>();

  constructor(
    private socket: SocketService,
    private router: Router
  ) {
    this.socket.on('tokenError').subscribe((data) => {
      console.log('on: tokenError');
      console.log(data);
        if (data.error == 'TIME_OUT_TOKEN'){
          this.socket.emit('tokenRefresh', {token_refresh: this.token_refresh}).subscribe();
        }    

        if (data.error == 'NOT_ISSET_TOKEN'){
          this.token = "";
          this.token_refresh = "";
          this.login = "";          
          this.router.navigate(['/']);
        }        
    });

    this.socket.on('tokenUpdate').subscribe((data) => {
      console.log('on: tokenUpdate');
      console.log(data);

      if (data.error == "ALL_CORRECT")     
      {
          this.token = data.token;
          this.socket.last_data_emit['token'] = this.token;
          this.socket.emit(this.socket.last_emit, this.socket.last_data_emit).subscribe();           
      } else
      {
          console.log(data.error);
          this.token = "";
          this.token_refresh = "";
          this.login = "";            
          this.router.navigate(['/']); 
      }
    });   

    this.socket.on('validLogOut').subscribe((data) => {
      console.log('on: validLogOut');

      this.token = "";
      this.token_refresh = "";
      this.login = "";

      console.log('Logout user');
      this.subject.next(this.login);

      this.router.navigate(['/']);    
    });
    
  }

  getUserSubscription(): Observable<any> {
      return this.subject.asObservable();
  }

  setToken(token) {
    this.token = token;
  }  

  setTokenRefresh(token_refresh) {
    this.token_refresh = token_refresh;
  }
  
  getToken() {
    return this.token;
  }

  getTokenRefresh() {
    return this.token_refresh;
  }

  getLogin(): Observable<any> {
    return Observable.of(this.login);
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
}