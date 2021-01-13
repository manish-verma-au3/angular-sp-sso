import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private route: ActivatedRoute,private router: Router,) { }

  ngOnInit(): void {
    localStorage.removeItem("token");
    this.router.navigate(['/home']);
  }

}
