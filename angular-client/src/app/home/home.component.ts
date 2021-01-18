import { Component, OnInit } from '@angular/core';
import { SsoService } from '../services/sso.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private sso:SsoService) { }

  ngOnInit(): void {
    this.sso.claimSSO();
  }

}
