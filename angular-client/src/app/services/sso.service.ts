import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SsoService {
  token: string;

  constructor(private route: ActivatedRoute, private router: Router,
    private http: HttpClient) {
    this.token = this.route.snapshot.queryParams['token'];
    //console.log("token=" + this.token);
  }

  getToken() {
      return this.token;
  }

  decryptToken(token:any){
    var key = CryptoJS.enc.Utf8.parse('mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5');
    var iv = CryptoJS.enc.Utf8.parse('mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5');
    var decrypted = CryptoJS.AES.decrypt(atob(token), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}
