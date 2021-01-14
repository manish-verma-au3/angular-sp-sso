import { Component, OnInit } from '@angular/core';
import { SsoService } from '../services/sso.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  token: string;
  nameId:string;

  constructor(private sso:SsoService) { }

  ngOnInit(): void {
    this.token = this.sso.getToken();
    if(this.token)
    {
      let decryptTokenData = this.sso.decryptToken(this.token);
      let parseTokenData = JSON.parse(decryptTokenData);
      this.checkAuth(parseTokenData);
    }
   
  }

  navigateToLogin() {
    window.location.href = environment.sp_base_url + 'login';
  }

  navigateToLogout() {
    window.location.href = environment.sp_base_url + 'logout?token='+this.token;
  }

  get checkToken() {
    if (localStorage.getItem('token') !== 'undefined') {
      return this.token = localStorage.getItem('token');
    }
    else {
      return false;
    }
  }

  checkAuth(token: any) {
    if (token.data.login_status === false) {
      localStorage.removeItem("token");
      this.nameId = '';
    }
    else{
      this.nameId = token.data.name_id;
      localStorage.setItem('token', this.token);
    }
  }

}
