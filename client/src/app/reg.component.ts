import { Component } from '@angular/core';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'my-reg',
  templateUrl: './template/reg.component.html'
})
export class RegComponent {
  title = 'Registration';
  curLogin: string = '';
  curPass: string = '';
  curEmail: string = '';
  errorReg: string = '';

  constructor(
    private socket: SocketService,
    private user: UserService,
    private router: Router
  ) {
    // если ответ с сервера с не верной регистрацией
   this.socket.on('errorRegistration').subscribe((data) => {
      console.log('on: errorRegistration');
      console.log(data);
        this.errorReg = data.message;
   });

    // если ответ с сервера с не верной авторизацией
   this.socket.on('errorAuthorization').subscribe((data) => {
      console.log('on: errorAuthorization');
      console.log(data);
        this.errorReg = data.message;
   });

    this.socket.on('validAuthorization').subscribe((data) => {
      console.log('on: validAuthorization');
      console.log(data);
      this.user.loginUser(data.token, data.token_refresh, this.curLogin);
    });
  }

  submitRegUser(): void {
    var data = {
        login : this.curLogin,
        pass : this.curPass,
        mail : this.curEmail
    };

    // collect data to send to the server
    this.socket.emit('userRegistration', data).subscribe();
  }  
}