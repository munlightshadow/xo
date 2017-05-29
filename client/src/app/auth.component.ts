import { Component } from '@angular/core';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';

@Component({
  selector: 'my-auth',
  templateUrl: './template/auth.component.html'
})
export class AuthComponent {
  title = 'Authorization';
  curLogin: string = '';
  curPass: string = '';
  errorAuth: string = '';

  constructor(
    private socket: SocketService,
    private user: UserService    
  ) {
    // console.log('Player clicked "Start"');
    // если ответ с сервера с не верной авторизацией
   this.socket.on('errorAuthorization').subscribe((data) => {
     console.log('on: errorAuthorization');
      console.log(data);
        this.errorAuth = data.message;
   });

    this.socket.on('validAuthorization').subscribe((data) => {
      console.log('on: validAuthorization');
      console.log(data);
      this.user.loginUser(data.token, data.token_refresh, this.curLogin);
    });
  }

  submitAuthUser(): void {
    var data = {
        login : this.curLogin,
        pass : this.curPass
    };

    // collect data to send to the server
    this.socket.emit('userAuthorization', data).subscribe();
  }  
}