import { Component, OnInit } from '@angular/core';
import { Product } from "../../models/product";
import { ProductService } from "../../services/product.service";
import { environment } from "../../environments/environment";
import { ProductImage } from "../../models/product.image";
import { CartService } from "../../services/cart.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Comment } from '../../models/comment';
import { CommentDTO } from '../../models/comment';
import { CommentService } from '../../services/comment.service';
import { ToastrService } from "ngx-toastr";
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.css',
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  comments: Comment[] = [];
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  isPressedAddToCart: boolean = false;
  reviewContent: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 3;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];

  // --- BIẾN CHỨA DỮ LIỆU GỢI Ý ---
  recommendedProducts: Product[] = []; // Khối dưới cùng
  accessories: Product[] = [];         // Khối mua kèm (phụ kiện)

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private commentService: CommentService,
    private router: Router,
    private toastr: ToastrService,
    private trackingService: TrackingService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam !== null) {
        const newProductId = +idParam;
        
        if (this.productId !== newProductId && this.productId !== 0) {
          this.quantity = 1;
          this.currentImageIndex = 0;
          this.isPressedAddToCart = false;
          window.scrollTo(0, 0); 
        }
        
        this.productId = newProductId;
        this.loadProductDetails();
      }
    });
  }

  loadProductDetails() {
    if (!isNaN(this.productId)) {
      this.productService.getDetailProduct(this.productId).subscribe({
        next: (response: any) => {
          if (response.product_images && response.product_images.length > 0) {
            response.product_images?.forEach((product_image: ProductImage) => {
              product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
            });
          }
          
          this.product = response;
          this.showImage(0);

          this.trackUserAction('VIEW');

          // Load các khối gọi ý
          this.loadRecommendedProducts();
          this.loadAccessories(); 
        },
        error: (error: any) => {
          console.error('Error fetching detail:', error);
        }
      });

      this.getCommentProducts(this.productId, this.currentPage, this.itemsPerPage);
    }
  }

  // --- HÀM TẢI PHỤ KIỆN MUA KÈM ---
  // Đổi thử sang hàm này nếu hàm newest bị lỗi

  loadAccessories() {
    this.productService.getAccessories(this.productId).subscribe({
      next: (res: any) => {
        // API Spring Boot trả về thẳng 1 List (mảng), nên gán thẳng res vào biến
        this.accessories = res || [];
        console.log("Phụ kiện mua kèm: ", this.accessories); // In ra để anh dễ check
      },
      error: (err) => {
        console.error('Không có phụ kiện hoặc lỗi API:', err);
        this.accessories = []; // Nếu API báo lỗi (vd: 204 No Content), gán mảng rỗng để Angular tự ẩn khối giao diện đi
      }
    });
  }

  // --- HÀM TẢI SẢN PHẨM GỢI Ý ---
  loadRecommendedProducts() {
    this.productService.getRecommendedProducts(this.productId).subscribe({
      next: (recResponse: any) => {
        this.recommendedProducts = recResponse || [];
      },
      error: (err) => {
        console.error('Lỗi khi lấy sản phẩm gợi ý:', err);
      }
    });
  }

  // --- XỬ LÝ ẢNH ---
  getProductImageUrl(product: any): string {
    const defaultImageUrl = 'assets/images/default-product-image.png'; 
    if (!product) return defaultImageUrl;

    if (product.product_images && product.product_images.length > 0 && product.product_images[0].image_url) {
      return `${environment.apiBaseUrl}/products/images/${product.product_images[0].image_url}`;
    } 
    else if (product.thumbnail) {
      return `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
    }
    return defaultImageUrl;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/default-product-image.png';
  }

  showImage(index: number): void {
    if (this.product && this.product.product_images && this.product.product_images.length > 0) {
      if (index < 0) index = 0;
      else if (index >= this.product.product_images.length) index = this.product.product_images.length - 1;
      this.currentImageIndex = index;
    }
  }

  thumbnailClick(index: number) {
    this.currentImageIndex = index;
  }

  nextImage(): void { this.showImage(this.currentImageIndex + 1); }
  previousImage(): void { this.showImage(this.currentImageIndex - 1); }

  // --- XỬ LÝ GIỎ HÀNG ---
  addToCart(): void {
    this.isPressedAddToCart = true;
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity);
      this.toastr.success(`Đã thêm ${this.product.name} vào giỏ`, "Thành công", { timeOut: 2000 });
      this.trackUserAction('ADD_TO_CART');
    }
  }

  addAccessoryToCart(item: any): void {
    this.cartService.addToCart(item.id, 1);
    this.toastr.success(`Đã thêm ${item.name} vào giỏ hàng`, "Thành công", { timeOut: 2000 });
  }

  increateQuantity(): void { this.quantity++; }
  decreaseQuantity(): void { if (this.quantity > 1) this.quantity--; }

  getTotalPrice(): number {
    if (this.product) return this.product.price * this.quantity;
    return 0;
  }

  buyNow() {
    if (this.isPressedAddToCart == false) {
      this.addToCart();
    }
    this.router.navigate(['/orders']);
    window.scrollTo(0, 0); 
  }

  // --- XỬ LÝ ĐÁNH GIÁ ---
  submitReview(): void {
    if (!this.reviewContent.trim()) return;

    const userData = localStorage.getItem('user');
    let user_id: number = 0;

    if (userData) {
      const user = JSON.parse(userData);
      user_id = user.id;

      const commentDTO: CommentDTO = {
        product_id: this.productId,
        user_id: user_id,
        content: this.reviewContent
      };

      this.commentService.insertComment(commentDTO).subscribe({
        next: (response: any) => {
          this.toastr.success("Đánh giá sản phẩm thành công", "Thành công", { timeOut: 2000 });
          location.reload();
        },
        error: (error: any) => {
          this.toastr.error("Đánh giá sản phẩm thất bại", "Thất bại", { timeOut: 2000 });
        }
      });
    }
    this.reviewContent = '';
  }

  getCommentProducts(productId: number, page: number, limit: number) {
    this.commentService.getComments(productId, page, limit).subscribe({
      next: (response: any) => {
        this.comments = response.comments;
        this.totalPages = response.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getCommentProducts(this.productId, this.currentPage, this.itemsPerPage);
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    const visiblePages = [];
    for (let i = startPage; i <= endPage; i++) visiblePages.push(i);
    return visiblePages;
  }

  private trackUserAction(actionType: 'VIEW' | 'ADD_TO_CART') {
    let userId = undefined;
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      userId = user.id;
    }
    this.trackingService.trackEvent(this.productId, actionType, userId);
  }
}