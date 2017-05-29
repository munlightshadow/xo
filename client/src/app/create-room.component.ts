import { Component } from '@angular/core';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'my-create-room',
  templateUrl: './template/create-room.component.html'
})
export class CreateRoomComponent {
  title = 'Create room';
  gameId = 'Error!!';
  log: any = '';

  constructor(
    private socket: SocketService,
    private user: UserService,
    private room: RoomService,
    private router: Router
  ) {
    this.socket.on('newGameCreated').subscribe((data) => {
      console.log('on: newGameCreated');
      console.log(data);
        this.gameId = data.gameId;
        this.room.gameId = data.gameId;
        this.room.mySocketId = data.mySocketId;
    });

    this.socket.on('addInLogArea').subscribe((data) => {
      console.log('on: addInLogArea');
      console.log(data);
        this.log += data.message;
    });

    this.socket.on('beginNewGame').subscribe((data) => {
      console.log('on: beginNewGame');
      console.log(data);
      this.router.navigate(['/board']); 
    });    

    this.socket.emit('playerCreateNewGame', {token : this.user.token}).subscribe();

/*

    this.socket.on('validAuthorization').subscribe((data) => {
      console.log('on: validAuthorization');
      console.log(data);
      this.user.loginUser(data.token, data.token_refresh, this.curLogin);
    });
*/    
  }

  backToStartPage(): void {
    var data = {
      token : this.user.token
    };
   
    this.socket.emit('playerLeaveRoom', data).subscribe(); 
    
    this.router.navigate(['/']); 
  } 
}