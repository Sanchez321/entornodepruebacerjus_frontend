import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CuentaService } from '../services/cuenta.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-cuenta-confirmar-correo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmar-correo.html',
  styleUrl: './confirmar-correo.css',
})
export class ConfirmarCorreo implements OnInit {
  private route = inject(ActivatedRoute);
  private cuentaService = inject(CuentaService);
  private pageMeta = inject(PageMetaService);
  estado: number | null = null;

  loading = true;
  ok = false;
  message = '';

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Confirmar correo',
      ruta: ['/login'],
    });

    const token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!token) {
      this.loading = false;
      this.ok = false;
      this.message = 'El enlace de confirmación no contiene un token válido.';
      return;
    }

    this.cuentaService.confirmarCorreo(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.ok = true;
        this.estado = res.estado;
        this.message = res.message || 'Correo confirmado correctamente.';
      },
      error: (err) => {
        this.loading = false;
        this.ok = false;
        this.message =
          err?.error?.message ||
          'No se pudo confirmar el correo. El enlace puede ser inválido o haber expirado.';
      },
    });
  }
}