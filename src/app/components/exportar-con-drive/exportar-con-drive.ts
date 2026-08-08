import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-exportar-con-drive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exportar-con-drive.html',
  styleUrl: './exportar-con-drive.css',
})
export class ExportarConDriveComponent {
  @Input() label = 'Descargar';
  @Input() loadingLabel = 'Preparando…';
  @Input() helperText = '';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() exportar = new EventEmitter<boolean>();

  guardarDrive = false;

  emitir(): void {
    if (this.disabled || this.loading) return;
    this.exportar.emit(this.guardarDrive);
  }
}
