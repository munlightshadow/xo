import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';


import { AppComponent }    		from './app.component';
import { StartPageComponent }   from './start-page.component';
import { CreateRoomComponent }  from './create-room.component';
import { JoinRoomComponent }  	from './join-room.component';
import { AuthComponent }   		from './auth.component';
import { RegComponent }   		from './reg.component';
import { BoardComponent }  		from './board.component';

import { AppRoutingModule }     from './app-routing.module';
import { SocketService } 		from './services/socket/socket.service';
import { UserService } 			from './services/user/user.service';
import { RoomService } 			from './services/room/room.service';


@NgModule({
  imports:      [ BrowserModule, FormsModule, AppRoutingModule ],
  declarations: [ AppComponent, AuthComponent, RegComponent, BoardComponent, StartPageComponent, CreateRoomComponent, JoinRoomComponent ],
  bootstrap:    [ AppComponent ],
  providers: [
   SocketService, UserService, RoomService
  ]
})
export class AppModule { }