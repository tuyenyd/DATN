import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Cuộn lên đầu trang khi mới vào trang Giới thiệu
    window.scrollTo(0, 0);
  }

  // Hàm dự phòng nếu file ảnh about-nexohome.jpg bị mất
  handleImageError(event: any) {
    event.target.src = 'assets/images/default-product-image.png'; 
  }
}