import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
  }
  references() {

    this.router.navigate(['/reference']);
    //this.router.navigate([]).then(result => {  window.open( `/referance`, '_blank'); });
  }
  admin() {
    this.router.navigate(['/login']);
  }
  metrics() {

    // this.router.navigate(['/referance'] );
    this.router.navigate([]).then(result => { window.open(`/metrics`, '_blank'); });
  }


  reset() {
   location.href = "/";
  }
}

