import { Component, OnInit  } from '@angular/core';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
	styles: [`
		.board-table {
			border-collapse: collapse;
			color: #369;
			font-family: Arial, Helvetica, sans-serif;
			font-size: 200%;
		}
		.board-cell {
			border: solid 1px black;	
			width: 40px;
			height: 40px;		
			text-align: center;
		}
	`],
    selector: 'my-board',
	template: `
    <div>
      symbol: {{symbol}} <span *ngIf="turn"> (you turn) </span> {{message}}
    </div>
	  <div>
	    <table class="board-table">
		    <tr *ngFor="let row of board; let y = index">
		    	<td class="board-cell" *ngFor="let cell of row; let x = index" (click)="onClick(x, y)">{{board[y][x]}}</td>
		    </tr>
      </table>
	  </div>
    <div *ngIf="!gameEnd">
      <button (click)="surrender()" style="margin-top:20px;" class="btn left">Surrender</button>
    </div>
    <div *ngIf="gameEnd">
      <button (click)="back()" style="margin-top:20px;" class="btn left">Back</button>
    </div>    
	`  
})
export class BoardComponent implements OnInit {
  field: number = 15;
  board: string[][] = [];
  turn = false;
  symbol = "";
  gameEnd = false;
  message = "";

  constructor(
    private socket: SocketService,
    private room: RoomService,
    private user: UserService,
    private router: Router

  ) {
    this.socket.on('gameEnd').subscribe((data) => {
      console.log('on: gameEnd');
      console.log(data);
        if (data.win){
            this.message = 'ПОБЕДА';
        } else {
            this.message = 'ПОРАЖЕНИЕ';
        }
        this.gameEnd = true;
    });

    this.socket.on('gameInit').subscribe((data) => {
      console.log('on: gameTurn');
      console.log(data);
        this.symbol = data.symbol;
    });

    this.socket.on('gameTurn').subscribe((data) => {
      console.log('on: gameTurn');
      console.log(data);
        this.board[data.y][data.x] = data.symbol;
    });    

    this.socket.on('gameGetTurn').subscribe((data) => {
      console.log('on: gameTurn');
      console.log(data);
        this.turn = true;
    });         
  }

  ngOnInit(): void {
    for(var y: number = 0; y < this.field; y++) {
  		this.board[y] = [];
  		for(var x: number = 0; x < this.field; x++) {
  			this.board[y][x] = '';
  		}
    }
  }  

  onClick(x: number, y: number): void {
  	if (this.board[y][x] == '' && this.turn) {
	    this.board[y][x] = this.symbol;
      
      var data = {
          token : this.user.token,
          gameId : this.room.gameId,
          x : x,
          y : y,
          symbol : this.symbol
      };      
      this.turn = false;
      this.socket.emit('gameLogicSetTurn', data).subscribe();
  	}
  }

  surrender(): void {
    var data = {
        token : this.user.token,
        gameId : this.room.gameId,
    };      

    this.socket.emit('gameLogicSurrender', data).subscribe();
    this.router.navigate(['/']); 
  }  

  back(): void {
    var data = {
        token : this.user.token,
        gameId : this.room.gameId,
    };      

    this.socket.emit('gameLogicLeaveRoomAfterWin', data).subscribe();
    this.router.navigate(['/']); 
  }   
}