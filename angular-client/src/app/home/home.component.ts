import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  token: string;
  constructor(private route: ActivatedRoute, private router: Router,
    private http: HttpClient,) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    console.log("token=" + this.token);
    
    if (this.token) {
      var key = CryptoJS.enc.Utf8.parse('mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5');
      var iv = CryptoJS.enc.Utf8.parse('mcXUpsjDD39IYnrMf64P3CtlxkdHfSn5');
      var decrypted = CryptoJS.AES.decrypt(atob(this.token), key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      this.checkToken(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
    }
  }

  navigateToLogin() {
    window.location.href = 'http://localhost:4000/login';
  }

  navigateToLogout() {
    window.location.href = 'http://localhost:4000/logout?token='+this.token;
  }

  get settoken() {
    if (localStorage.getItem('token') !== 'undefined') {
      console.log("yes");
      return this.token = localStorage.getItem('token');
    }
    else {
      console.log("else");
      return false;
    }
  }

  checkToken(token: any) {
    if (token.data.status === false) {
      localStorage.removeItem("token");
    }
    else{
      localStorage.setItem('token', this.token);
    }
  }

}
