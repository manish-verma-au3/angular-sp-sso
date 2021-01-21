import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from './security.service';
import { User } from '../models';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SsoService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  t: string;
  sessionIndex: string = '';
  secretKey: any = 'mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cookieService: CookieService,
    private security: SecurityService,) {
    if (this.cookieService.get('auth') !== '') {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(this.security.get(this.secretKey, this.cookieService.get('auth'))));
    }
    else {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(null));
    }
    this.currentUser = this.currentUserSubject.asObservable();

    this.t = this.route.snapshot.queryParams['token'];
    if (this.t === undefined || this.t === null || this.t === "") {
      this.t = this.getToken();
    }

    if (this.t) {
      let parseToken = this.tokenParse(this.t);
      this.checkAuthentication(parseToken);
    }
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  //get token
  getToken() {
    if (this.currentUserValue !== null) {
      let authInfo = JSON.parse(this.security.get(this.secretKey, this.cookieService.get('auth')));
      this.t = authInfo.token;
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
  checkAuthentication(token: any) {
    if (token.data.login_status === false) {
      this.setLogout();
    }
    else {
      let uData = {
        "name_id": token.data.name_id,
        "session_index": token.data.session_index,
        "login_status": true,
        'token': this.t,
      }
      if (location.hostname === "localhost") {
        this.cookieService.set('auth', this.security.set(this.secretKey, JSON.stringify(uData)), 60, '/');
      }
      else {
        this.cookieService.set('auth', this.security.set(this.secretKey, JSON.stringify(uData)), 60, '/', environment.appDomain);
      }
      this.currentUserSubject.next(uData);
    }
  }

  // claim sso when we try to access any service or component
  claimSSO() {
    if (this.currentUserValue) {
      this.sessionIndex = this.currentUserValue.session_index;
      this.http.post('saml/claim', { 'session_index': this.sessionIndex })
        .subscribe(
          (data: any) => {
            if (data.code === 200 && data.status === 'success') {
              console.log("claim sso call");
            }
            else {
              this.setLogout();
            }
          },
          error => {
            console.log(error);
          });
    }

  }

  // check token that it is set in frontend or not
  checkToken() {
    if (this.currentUserValue !== null) {
      return true;
    }
    else {
      return false;
    }
  }

  setLogout() {
    if (location.hostname === "localhost") {
      this.cookieService.delete('auth', '/', location.hostname);
    }
    else {
      this.cookieService.delete('auth', '/', environment.appDomain);
    }
    this.currentUserSubject.next(null);
    localStorage.clear();
    sessionStorage.clear();
  }

}
