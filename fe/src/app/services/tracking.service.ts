import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; // Nhớ check lại đường dẫn environment của bạn nhé

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  // Thay đổi domain theo đúng cổng Spring Boot của bạn
  private apiUrl = 'http://localhost:8080/api/v1/tracking/behavior';

  constructor(private http: HttpClient) {}

  // Hàm sinh ID ngẫu nhiên cho khách chưa đăng nhập (lưu vào LocalStorage)
  private getSessionId(): string {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  }

  // Hàm bắn sự kiện về Backend
  trackEvent(productId: number, actionType: 'VIEW' | 'ADD_TO_CART' | 'PURCHASE', userId?: number) {
    const payload = {
      userId: userId || null, 
      sessionId: this.getSessionId(),
      productId: productId,
      actionType: actionType
    };

    // Gọi API ngầm, không cần subscribe dài dòng để tránh ảnh hưởng UI
    this.http.post(this.apiUrl, payload).subscribe({
      next: (res) => console.log('Đã bắn tracking thành công:', payload),
      error: (err) => console.log('Tracking error (ignored):', err)
    });
  }
}