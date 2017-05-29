import { Component, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { BoardComponent } from './board.component';
import { AuthComponent } from './auth.component';
import { UserService } from './services/user/user.service';

@Component({
  selector: 'my-app',
  templateUrl: './template/start-page.component.html'
})
export class StartPageComponent {
  subscription: Subscription;
  title = 'XO';
  welcom = "";
  isset_auth = false;
 
  constructor(
    private user: UserService
  ) {
    this.subscription = this.user.getLogin().subscribe(login => {
    	if (login != "") {
    		this.isset_auth = true;
    		this.welcom = 'HI ' + login;
    	}
    });
  };  

  ngOnDestroy() {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
  }

  logoutUser(): void {
  	this.isset_auth = false;
  	this.user.logoutUser();
  }
}