import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SsoService {
  t: string;
  sessionIndex: string = '';
  secretKey: any = 'mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
    this.t = this.route.snapshot.queryParams['token'];
    let tkn = this.getToken();
    if (tkn) {
      let parseToken = this.tokenParse(tkn);
      this.checkAuth(parseToken);
    }
  }

  //get token
  getToken() {
    if (localStorage.getItem('token') !== null) {
      this.t = localStorage.getItem('token');
    }
    if (this.t === undefined || this.t === null || this.t === "") {
      this.t = null;
    }
    return this.t;
  }

  // get token parse data
  tokenParse(token: any) {
    if (token) {
      let decryptTokenData = this.decryptToken(token);
      let parseTokenData = JSON.parse(decryptTokenData);
      return parseTokenData;
    }
    else {
      return null;
    }
  }
  // dycrypt token
  decryptToken(token: any) {
    var key = CryptoJS.enc.Utf8.parse(this.secretKey);
    var iv = CryptoJS.enc.Utf8.parse(this.secretKey);
    var decrypted = CryptoJS.AES.decrypt(atob(token), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  //login by sso
  loginSSO() {
    window.location.href = environment.sp_base_url + 'login';
  }

  //logout by sso
  logoutSSO() {
    window.location.href = environment.sp_base_url + 'logout?token=' + this.t;
  }

  // check authentication of token
  checkAuth(token: any) {
    if (token.data.login_status === false) {
      localStorage.removeItem("token");
    }
    else {
      localStorage.setItem('token', this.t);
    }
  }

  // claim sso when we try to access any service or component
  claimSSO() {
    console.log("sso clainm token = " + this.t);
    if (this.t) {
      this.sessionIndex = this.tokenParse(this.t).data.session_index;
      this.http.post('saml/claim', { 'session_index': this.sessionIndex })
        .subscribe(
          (data: any) => {
            if (data.code === 200 && data.status === 'success') {
              console.log("claim sso call");
            }
            else {
              localStorage.removeItem("token");
            }
          },
          error => {
            console.log(error);
          });
    }

  }

  // check token that it is set in frontend or not
  checkToken() {
    if (localStorage.getItem('token') !== null) {
      return true;
    }
    else {
      return false;
    }
  }

}
