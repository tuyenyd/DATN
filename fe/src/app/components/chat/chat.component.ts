import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  isOpen = false;
  isLoading = false;
  userInput = '';
  
  messages: { sender: 'user' | 'bot', text: string }[] = [
    { sender: 'bot', text: 'Dạ em chào anh/chị. Em là trợ lý AI của NexoHome. Anh/chị đang tìm sản phẩm gì ạ?' }
  ];

  constructor(private chatService: ChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ sender: 'user', text: text });
    this.userInput = '';
    this.isLoading = true;

    this.chatService.askAI(text).subscribe({
      next: (res: any) => {
        this.messages.push({ sender: 'bot', text: res.reply });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: 'Hệ thống đang bảo trì, anh/chị vui lòng thử lại sau ạ.' });
        this.isLoading = false;
      }
    });
  }
}