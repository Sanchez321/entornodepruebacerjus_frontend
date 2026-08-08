import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/auth/auth.service';

@Component({
  selector: 'app-cuenta-ingresar',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './ingresar.html',
  styleUrl: './ingresar.css'
})
export class Ingresar implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;       
  error = ''; 

  inputsReady = false;
  private firstPaintAt = 0;
  private readonly minSkeletonMs = 180;

  logoLoaded = false;
  logoMissing = false;

  @ViewChild('emailInput', { read: ElementRef }) emailEl!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { read: ElementRef }) passEl!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.firstPaintAt = performance.now();
    this.inputsReady = false;

    const tryReveal = (force = false) => {
      if (this.inputsReady) return;
      const elapsed = performance.now() - this.firstPaintAt;
      const minReached = elapsed >= this.minSkeletonMs;
      const eHas = !!this.emailEl?.nativeElement.value;
      const pHas = !!this.passEl?.nativeElement.value;
      if (minReached && (force || eHas || pHas)) this.inputsReady = true;
    };

    setTimeout(() => tryReveal(true), this.minSkeletonMs);
    setTimeout(() => tryReveal(true), 50);
    setTimeout(() => tryReveal(true), 250);

    this.emailEl.nativeElement.addEventListener('input', () => tryReveal(true), { passive: true });
    this.passEl.nativeElement.addEventListener('input', () => tryReveal(true), { passive: true });
  }

  onLogoLoad() { this.logoLoaded = true; this.logoMissing = false; }
  onLogoError() { this.logoLoaded = false; this.logoMissing = true; }

  onLogin() {
    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      this.error = 'Debe ingresar email y contraseña.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/ciudadano');
      },
      error: (err) => {
        this.loading = false;
        this.error = this.getLoginErrorMessage(err);
      }
    });
  }
  private getLoginErrorMessage(err: any): string {
    const code =
      err?.error?.code ??
      err?.error?.response?.code ??
      err?.error?.error?.code ??
      null;

    switch (code) {
      case 'AUTH_EMAIL_NOT_CONFIRMED':
        return 'Debes confirmar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada.';

      case 'AUTH_USER_NOT_AUTHORIZED':
        return 'Tu cuenta ya confirmó el correo, pero aún está pendiente de autorización.';

      case 'AUTH_USER_SUSPENDED':
        return 'Tu cuenta está suspendida. Comunícate con el responsable del sistema.';

      case 'AUTH_USER_DELETED':
        return 'Tu cuenta ha sido eliminada o ya no está disponible.';

      case 'AUTH_INVALID_CREDENTIALS':
        return 'Credenciales inválidas. Verifica tu correo y contraseña.';

      case 'AUTH_USER_NOT_ACTIVE':
        return 'Tu cuenta no está activa.';

      default:
        return err?.error?.message || 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    }
  }
}