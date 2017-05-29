import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent }  		from './auth.component';
import { RegComponent }  		from './reg.component';
import { AppComponent }  		from './app.component';
import { StartPageComponent }   from './start-page.component';
import { CreateRoomComponent }  from './create-room.component';
import { JoinRoomComponent }  	from './join-room.component';
import { BoardComponent }  		from './board.component';

const routes: Routes = [
  { path: '', redirectTo: '/start-page', pathMatch: 'full' },
  { path: 'auth',  component: AuthComponent },
  { path: 'reg',  component: RegComponent },
  { path: 'start-page',  component: StartPageComponent },
  { path: 'create-room',  component: CreateRoomComponent },
  { path: 'join-room',  component: JoinRoomComponent },
  { path: 'board',  component: BoardComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}