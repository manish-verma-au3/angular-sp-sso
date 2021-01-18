import { Component, OnInit } from '@angular/core';
import { SsoService } from '../services/sso.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css']
})
export class UserinfoComponent implements OnInit {
  token: string;
  nameId: string;
  constructor(private sso: SsoService) { }

  ngOnInit(): void {
    this.token = this.sso.getToken();
    let tokenData = this.sso.tokenParse(this.token);
    if(tokenData)
    {
      if (tokenData.data.login_status === false) {
        this.nameId = '';
      }
      else {
        this.nameId = tokenData.data.name_id;
      }
    }
    
  }

  navigateToLogin() {
    this.sso.loginSSO();
  }

  navigateToLogout() {
    this.sso.logoutSSO();
  }

  get checkToken() {
    return this.sso.checkToken();
  }

}
