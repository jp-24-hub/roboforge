import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warn' | 'error';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(title: string, description?: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const item: ToastMessage = {
      id,
      title,
      description,
      type,
      timestamp: Date.now()
    };

    this.toasts.update((current) => [...current.slice(-4), item]);

    setTimeout(() => {
      this.dismiss(id);
    }, 3800);
  }

  dismiss(id: string) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
