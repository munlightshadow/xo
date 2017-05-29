import { Component } from '@angular/core';

import { UserService } from './services/user/user.service';

@Component({
  selector: 'my-app',
  template:
  `
  <div class="parent">
    <div class="content">
      <h1>{{title}}</h1>
      <router-outlet></router-outlet>
    </div>
  </div>
  `,
})
export class AppComponent {
  title = 'XO';

  constructor(
    private user: UserService
  ) {
//разобраться с обзервами и повесит зобавление в заголовке логина который засобмитился
  };  
}