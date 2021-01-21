import { Component, OnInit } from '@angular/core';
import { SsoService } from '../services/sso.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css']
})
export class UserinfoComponent implements OnInit {
  nameId: string;
  constructor(private sso: SsoService) { }

  ngOnInit(): void {
    if (this.sso.currentUserValue) {
      this.nameId = this.sso.currentUserValue.name_id;
    }
    else {
      this.nameId = '';
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
