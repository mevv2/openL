import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-review-window',
  templateUrl: './review-window.component.html',
  styleUrls: ['./review-window.component.css']
})
export class ReviewWindowComponent implements OnInit {
    public indicatorValue: string;

  constructor(private router: Router, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.indicatorValue = data.indicatorValue;
  }

  goToReview() {
    this.router.navigate(['/add/review']);
  }

  ngOnInit() {
  }

}
