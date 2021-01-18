import { Component, OnInit } from '@angular/core';
import { SsoService } from '../services/sso.service';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private sso:SsoService) { }

  ngOnInit(): void {
    this.sso.claimSSO();
  }

}
