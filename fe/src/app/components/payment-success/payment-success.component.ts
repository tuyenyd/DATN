import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-payment-success',
  template: `
    <div class="container" style="margin-top: 50px; margin-bottom: 50px; text-align: center;">
      <div class="result-container" [ngClass]="isSuccess ? 'success' : 'failed'" 
           style="padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: inline-block; min-width: 400px; background: white;">
        
        <div *ngIf="isLoading" style="padding: 30px;">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
          <h4 class="mt-4 text-primary">Đang xác thực giao dịch...</h4>
          <p class="text-muted">Vui lòng không đóng trình duyệt lúc này.</p>
        </div>

        <div *ngIf="!isLoading">
          <div *ngIf="isSuccess">
            <i class="fa-solid fa-circle-check" style="font-size: 60px; color: #28a745; margin-bottom: 20px;"></i>
            <h2 style="color: #28a745;">Thanh toán thành công!</h2>
            <p class="text-muted">Hệ thống đã ghi nhận thanh toán. Cảm ơn bạn đã mua sắm.</p>
          </div>

          <div *ngIf="!isSuccess">
            <i class="fa-solid fa-circle-xmark" style="font-size: 60px; color: #dc3545; margin-bottom: 20px;"></i>
            <h2 style="color: #dc3545;">Thanh toán thất bại!</h2>
            <p class="text-muted">Giao dịch đã bị hủy, lỗi mạng hoặc sai chữ ký bảo mật.</p>
          </div>

          <div *ngIf="paymentInfo" style="margin-top: 30px; text-align: left; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin-bottom: 10px; font-size: 16px;"><strong>Phương thức:</strong> {{ paymentInfo.method }}</p>
            <p style="margin-bottom: 10px; font-size: 16px;"><strong>Mã đơn hàng:</strong> #{{ paymentInfo.orderCode }}</p>
            <p style="margin-bottom: 10px; font-size: 16px;">
              <strong>Số tiền:</strong> <span style="color: #d10024; font-weight: bold;">{{ paymentInfo.amount | number:'1.0-0' }} đ</span>
            </p>
            <p style="margin-bottom: 0; font-size: 16px;"><strong>Trạng thái:</strong> {{ paymentInfo.status }}</p>
          </div>

          <button class="btn btn-primary mt-4 px-4 py-2" (click)="goHome()" style="border-radius: 20px;">
            <i class="fa-solid fa-house mr-2"></i> Trở về trang chủ
          </button>
        </div>

      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  paymentInfo: any;
  isSuccess: boolean = false;
  isLoading: boolean = true; // Bật Loading ngay khi vào trang

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient // Tiêm HttpClient để gọi API
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // KIỂM TRA: Nếu là VNPay trả về
      if (params['vnp_ResponseCode']) {
        this.verifyVNPayPayment(params);
      } 
      // KIỂM TRA: Nếu là PayOS trả về (Dự phòng)
      else if (params['code']) {
        this.isLoading = false;
        this.isSuccess = params['code'] === '00';
        this.paymentInfo = {
          method: 'PayOS',
          orderCode: params['orderCode'] || 'N/A',
          amount: 0, 
          status: this.isSuccess ? 'Giao dịch thành công' : 'Giao dịch thất bại / Bị hủy'
        };
      } else {
        // Nếu không có tham số gì, cho về trang chủ
        this.router.navigate(['/']);
      }
    });
  }

  // --- HÀM GỌI BACKEND ĐỂ XÁC THỰC VNPAY ---
  verifyVNPayPayment(params: any) {
    // Gọi xuống API bạn đã viết trong PaymentController.java
    this.http.get(`${environment.apiBaseUrl}/payment/vn-pay-callback`, { params: params })
      .subscribe({
        next: (response: any) => {
          // Backend báo OK -> Cập nhật giao diện thành công
          this.isLoading = false;
          this.isSuccess = true;
          this.paymentInfo = {
            method: 'VNPay',
            orderCode: params['vnp_TxnRef'], // ID Đơn hàng
            amount: Number(params['vnp_Amount']) / 100, // VNPay luôn nhân 100 số tiền nên phải chia lại
            status: 'Hệ thống đã ghi nhận thanh toán'
          };
        },
        error: (error) => {
          // Backend báo Lỗi (Sai chữ ký, Hủy thanh toán,...) -> Giao diện thất bại
          this.isLoading = false;
          this.isSuccess = false;
          this.paymentInfo = {
            method: 'VNPay',
            orderCode: params['vnp_TxnRef'],
            amount: Number(params['vnp_Amount']) / 100,
            status: 'Giao dịch thất bại hoặc bị cảnh báo bảo mật'
          };
        }
      });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}