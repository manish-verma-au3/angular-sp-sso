import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-client';
  navigateToLogin()
  {
    console.log("Login");
    window.location.href = 'http://localhost:4000/login';
  }
  navigateToLogout()
  {
    window.location.href = 'http://localhost:4000/logout';
  }
}
