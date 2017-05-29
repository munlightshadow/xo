import { Component } from '@angular/core';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'my-join-room',
  templateUrl: './template/join-room.component.html'
})
export class JoinRoomComponent {
  title = 'Join room';
  rooms: any;
  curGame: string = "";
  error: string = "";
  started = false;
  log: any = '';


  constructor(
    private socket: SocketService,
    private room: RoomService,
    private user: UserService,
    private router: Router    
  ) {
    // console.log('Player clicked "Start"');
    // если ответ с сервера с не верной авторизацией
    this.socket.on('getFreeRooms').subscribe((data) => {
      console.log('on: getFreeRooms');
      console.log(data);

      this.rooms = data.rooms;
    });

    this.socket.on('updateListRoom').subscribe((data) => {
      console.log('on: updateListRoom');
      console.log(data);

      this.rooms = data.rooms;
    });    

    this.socket.on('errorRoom').subscribe((data) => {
      console.log('on: error');
      console.log(data);

      this.error = data.message;
      this.started = false;      
      this.room.gameId = "";
      alert(data.message);
    });    

    this.socket.on('playerJoinedRoom').subscribe((data) => {
      console.log('on: playerJoinedRoom');
      console.log(data);
        this.room.gameId = data.gameId;
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

    this.socket.emit('playerClickJoinOnIntroScreen', {token : this.user.token}).subscribe();
  }

  joinGame(): void {
    var data = {
      gameId : this.curGame,
      token : this.user.token
    };
   
    this.started = true;
    this.socket.emit('playerJoinGame', data).subscribe(); 
  } 

  backToJoin(): void {
    var data = {
      token : this.user.token
    };
   
    this.room.gameId = "";
    this.socket.emit('playerLeaveRoom', data).subscribe(); 
    this.started = false;
  }    
}