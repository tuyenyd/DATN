import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class VnPayService {
    private apiBaseUrl = environment.apiBaseUrl;

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    // Cập nhật: Thêm orderId vào tham số truyền lên
    initiatePayment(orderId: number, totalMoney: number, bankCode: string = ''): Observable<any> {
        const params = new HttpParams()
            .set('orderId', orderId.toString())
            .set('amount', totalMoney.toString())
            .set('bankCode', bankCode);

        // Gọi đúng endpoint /payment/vn-pay mà bạn đã viết ở Backend
        return this.http.get<any>(`${this.apiBaseUrl}/payment/vn-pay`, { params });
    }
}