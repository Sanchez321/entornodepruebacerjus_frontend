import { Component, OnInit, OnDestroy, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {VMUsuarioDetalle,VMUsuarioUpdate,VMUsuarioUpdateForm,VMUsuarioCorregirIdentidadForm} from '../models/usuario.vm';
import { ApiTipoUsuario  } from '../models/usuario.api';
import { UsuarioService } from '../services/usuario.service';

import {EstadoUsuario,ESTADO_USUARIO_OPCIONES,estadoUsuarioToLabel,} from '../models/usuario.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

import { UsuarioHorarioListaUsuario } from 'src/app/pages/admin/usuario_horario/usuario_horario.lista.usuario/usuario_horario.lista.usuario';
import { firstValueFrom ,} from 'rxjs';


@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioHorarioListaUsuario],
  templateUrl: './usuario.detalle.html',
  styleUrl: './usuario.detalle.css',
})
export class UsuarioDetalle implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private usuarioService = inject(UsuarioService);

  reactivating = false;
  resettingPass = false;
  resendingVerification = false;
  authorizing = false;

  correctingIdentity = false;
  deleting = false;
  purging = false;

  showIdentityForm = false;

  usuario?: VMUsuarioDetalle;
  tipos: ApiTipoUsuario[] = [];

  isEditing = false;
  submittedEdit = false;
  open = true;
  openHorarios = true;

  estadoOpciones = ESTADO_USUARIO_OPCIONES;
  estadoOpcionesEdicion = ESTADO_USUARIO_OPCIONES.filter(
    (x) => x.value === 1 || x.value === 2,
  );

  originalData!: VMUsuarioUpdate;

  form = this.fb.group<ControlsOf<UsuarioDetalleForm>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    tz: new FormControl('', { nonNullable: true }),
    fechaCreadoPorTexto: new FormControl('', { nonNullable: true }),

    estado: new FormControl<EstadoUsuario | ''>(1, { nonNullable: true }),
    rolId: new FormControl<number | null>(null, { nonNullable: false }),
  });

  identityForm = this.fb.group<ControlsOf<UsuarioCorregirIdentidadFormLocal>>({
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{8,11}$/)],
    }),
    correoE: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(255)],
    }),
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.usuarioService.listAll().subscribe({
      next: (rows) => {
        this.tipos = rows ?? [];
      },
      error: () => {
        this.tipos = [];
      },
    });

    this.cargarUsuario(id);
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  private async cargarUsuario(id: number): Promise<void> {
    try {
      const usuario = await firstValueFrom(this.usuarioService.getById(id));
      this.aplicarUsuario(usuario);
    } catch {
      // El interceptor global ya maneja 404, etc.
    }
  }

  private aplicarUsuario(u: VMUsuarioDetalle): void {
    this.usuario = u;

    const fechaTxt = formatDateTime(u.fechaCreadoPor);

    this.pageMeta.replace({
      titulo: 'Usuario:',
      ruta: ['/admin/usuario/lista'],
    });

    this.form.patchValue({
      nombres: u.nombres,
      apellidoPaterno: u.apellidoPaterno,
      apellidoMaterno: u.apellidoMaterno,
      dni: u.dni,
      correoE: u.correoE,
      telefono: u.telefono,
      tz: u.tz,
      fechaCreadoPorTexto: fechaTxt,
      estado: u.estado,
      rolId: u.rolId ?? null,
    });

    this.originalData = {
      id: u.id,
      estado: u.estado,
      rolId: u.rolId ?? null,
    };

    this.form.get('estado')?.disable({ emitEvent: false });
    this.form.get('rolId')?.disable({ emitEvent: false });

    this.pageMeta.set({
      titulo: `Usuario: ${u.apellidoPaterno ?? ''} ${u.apellidoMaterno ?? ''}, ${u.nombres ?? ''} - DNI: ${u.dni ?? ''}`,
    });
  }

  async onEdit(ev: Event): Promise<void> {
    ev.stopPropagation();

    if (this.usuario?.estado === 0) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Usuario eliminado',
        message: 'No se puede editar el rol o estado de un usuario eliminado.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (this.usuario && !this.usuario.correoVerificado) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Correo no verificado',
        message: 'No se puede modificar el estado o rol hasta que el usuario confirme su correo.',
        primaryText: 'Aceptar',
      });
      return;
    }

    this.submittedEdit = false;
    this.isEditing = true;
    this.open = true;

    if (this.puedeEditarEstadoManual) {
      this.form.get('estado')?.enable({ emitEvent: false });
    } else {
      this.form.get('estado')?.disable({ emitEvent: false });
    }

    if (this.puedeEditarRolManual) {
      this.form.get('rolId')?.enable({ emitEvent: false });
    } else {
      this.form.get('rolId')?.disable({ emitEvent: false });
    }
  }

  async onCancel(): Promise<void> {
    if (this.hasUnsavedChanges()) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
      });
      if (!ok) return;
    }

    if (this.usuario) {
      const fechaTxt = formatDateTime(this.usuario.fechaCreadoPor);

      this.form.patchValue({
        nombres: this.usuario.nombres,
        apellidoPaterno: this.usuario.apellidoPaterno,
        apellidoMaterno: this.usuario.apellidoMaterno,
        dni: this.usuario.dni,
        correoE: this.usuario.correoE,
        telefono: this.usuario.telefono,
        tz: this.usuario.tz,
        fechaCreadoPorTexto: fechaTxt,
        estado: this.originalData.estado ?? this.usuario.estado,
        rolId: this.originalData.rolId ?? this.usuario.rolId ?? null,
      });
    }

    this.form.get('estado')?.disable({ emitEvent: false });
    this.form.get('rolId')?.disable({ emitEvent: false });

    this.isEditing = false;
    this.submittedEdit = false;
  }

  async onSave(): Promise<void> {
    this.submittedEdit = true;

    const v = this.form.value;
    const changes: VMUsuarioUpdateForm = {};

    if (
      v.estado !== undefined &&
      v.estado !== null &&
      v.estado !== this.originalData.estado
    ) {
      changes.estado = v.estado as EstadoUsuario;
    }

    if (v.rolId !== undefined && v.rolId !== this.originalData.rolId) {
      changes.rolId = v.rolId ?? null;
    }

    if (Object.keys(changes).length === 0) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios para guardar.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });

    if (!confirm) return;

    const id = this.originalData.id;

    if (id == null) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    try {
      await this.usuarioService.update(id, changes);

      this.originalData = { ...this.originalData, ...changes };

      if (this.usuario) {
        if (changes.estado != null) {
          this.usuario.estado = changes.estado;
          this.usuario.estadoTexto = estadoUsuarioToLabel(changes.estado);
        }

        if (changes.rolId !== undefined) {
          const rol = this.tipos.find((t) => t.tu_ID === changes.rolId);

          this.usuario.rolId = changes.rolId ?? null;
          this.usuario.rolNombre = rol?.tu_nombre ?? this.usuario.rolNombre;
          this.usuario.rolNivel = rol?.tu_nivel ?? this.usuario.rolNivel;
        }
      }

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información del usuario se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.form.get('estado')?.disable({ emitEvent: false });
      this.form.get('rolId')?.disable({ emitEvent: false });

      this.isEditing = false;
      this.submittedEdit = false;
    } catch {
      // El interceptor global muestra el error.
    }
  }

  private hasUnsavedChanges(): boolean {
    const v = this.form.value;

    if (v.estado !== this.originalData.estado) return true;
    if ((v.rolId ?? null) !== (this.originalData.rolId ?? null)) return true;

    return false;
  }

  async onResetContrasenaProvisional(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (this.usuario?.estado === 0) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Acción no permitida',
        message: 'No se puede generar contraseña provisional para un usuario eliminado.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Generar contraseña provisional',
      message:
        'Esto reemplazará la contraseña actual del usuario por una contraseña temporal.\n\n' +
        'Comparta la contraseña temporal con el usuario para que ingrese y luego la cambie en "Mi contraseña".\n\n' +
        '¿Desea continuar?',
      confirmText: 'Generar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.resettingPass = true;

    try {
      const resp = await this.usuarioService.resetContrasenaProvisional(id, 10);

      const copy = await this.notify.confirm({
        variant: 'info',
        title: 'Contraseña provisional generada',
        message:
          `Contraseña provisional:\n${resp.provisional}\n\n` +
          'Recomendación: Indique al usuario que la cambie apenas ingrese.',
        confirmText: 'Copiar',
        cancelText: 'Cerrar',
      });

      if (copy) {
        try {
          await navigator.clipboard.writeText(resp.provisional);

          await this.notify.ok({
            variant: 'success',
            title: 'Copiado',
            message: 'La contraseña provisional fue copiada al portapapeles.',
            primaryText: 'Aceptar',
          });
        } catch {
          await this.notify.ok({
            variant: 'warning',
            title: 'No se pudo copiar automáticamente',
            message:
              'No se pudo copiar al portapapeles por permisos del navegador.\n' +
              'Copie manualmente la contraseña mostrada.',
            primaryText: 'Aceptar',
          });
        }
      }
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.resettingPass = false;
    }
  }

  async onAutorizar(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Autorizar usuario',
      message:
        'Se activará la cuenta, se compartirá la carpeta principal de Drive con su correo y se enviará una notificación al usuario.\n\n¿Deseas continuar?',
      confirmText: 'Autorizar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.authorizing = true;

    try {
      await this.usuarioService.autorizar(id);

      await this.cargarUsuario(id);

      await this.notify.ok({
        variant: 'success',
        title: 'Usuario autorizado',
        message: 'La cuenta fue activada correctamente.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.authorizing = false;
    }
  }

  async onReenviarConfirmacionCorreo(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const correo = this.usuario?.correoE ?? '';

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Reenviar verificación',
      message:
        `Se enviará un nuevo correo de verificación a:\n${correo}\n\n` +
        'Los enlaces anteriores quedarán invalidados.\n\n' +
        '¿Deseas continuar?',
      confirmText: 'Reenviar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.resendingVerification = true;

    try {
      await this.usuarioService.reenviarConfirmacionCorreo(id);

      await this.notify.ok({
        variant: 'success',
        title: 'Correo reenviado',
        message: 'Se envió un nuevo correo de verificación.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.resendingVerification = false;
    }
  }

  onToggleCorregirIdentidad(ev: Event): void {
    ev.stopPropagation();

    if (!this.usuario) return;

    this.showIdentityForm = !this.showIdentityForm;
    this.open = true;

    if (this.showIdentityForm) {
      this.identityForm.reset({
        dni: this.usuario.dni ?? '',
        correoE: this.usuario.correoE ?? '',
        motivo: '',
      });
    }
  }

  async onCancelarCorregirIdentidad(): Promise<void> {
    this.showIdentityForm = false;

    this.identityForm.reset({
      dni: '',
      correoE: '',
      motivo: '',
    });
  }

  async onGuardarCorregirIdentidad(): Promise<void> {
    if (!this.usuario) return;

    this.identityForm.markAllAsTouched();

    if (this.identityForm.invalid) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos inválidos',
        message: 'Revisa el DNI, el correo y el motivo de corrección.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const v = this.identityForm.getRawValue();

    const nuevoDni = (v.dni ?? '').trim();
    const nuevoCorreo = (v.correoE ?? '').trim().toLowerCase();
    const motivo = (v.motivo ?? '').trim();

    const cambiaDni = !!nuevoDni && nuevoDni !== this.usuario.dni;
    const cambiaCorreo =
      !!nuevoCorreo && nuevoCorreo !== this.usuario.correoE.toLowerCase();

    if (!cambiaDni && !cambiaCorreo) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay DNI ni correo nuevos para corregir.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const mensajeCorreo =
      cambiaCorreo && this.usuario.correoVerificado && this.usuario.estado !== 0
        ? '\n\nComo el correo actual ya estaba verificado, el nuevo correo quedará pendiente hasta que el usuario lo confirme.'
        : cambiaCorreo && this.usuario.estado !== 0
          ? '\n\nSe enviará una nueva verificación al correo corregido.'
          : cambiaCorreo && this.usuario.estado === 0
            ? '\n\nComo el usuario está eliminado, no se enviará correo de verificación.'
            : '';

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Corregir identidad',
      message:
        'Se corregirán datos críticos del usuario.\n\n' +
        `Motivo: ${motivo}` +
        mensajeCorreo +
        '\n\n¿Deseas continuar?',
      confirmText: 'Corregir',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    const payload: VMUsuarioCorregirIdentidadForm = {
      motivo,
    };

    if (cambiaDni) payload.dni = nuevoDni;
    if (cambiaCorreo) payload.correoE = nuevoCorreo;

    this.correctingIdentity = true;

    try {
      const res = await this.usuarioService.corregirIdentidad(
        this.usuario.id,
        payload,
      );

      await this.cargarUsuario(this.usuario.id);

      this.showIdentityForm = false;

      await this.notify.ok({
        variant: 'success',
        title: 'Identidad corregida',
        message:
          res.message ||
          'La identidad del usuario fue corregida correctamente.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.correctingIdentity = false;
    }
  }

  async onEliminarUsuario(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Eliminar usuario',
      message:
        'El usuario quedará eliminado lógicamente y no podrá ingresar al sistema.\n\n' +
        'Sus registros asociados se conservarán.\n\n' +
        '¿Deseas continuar?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.deleting = true;

    try {
      await this.usuarioService.eliminar(id);
      await this.cargarUsuario(id);

      await this.notify.ok({
        variant: 'success',
        title: 'Usuario eliminado',
        message: 'El usuario fue eliminado correctamente.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.deleting = false;
    }
  }

  async onReactivarUsuario(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Reactivar usuario',
      message:
        'Se reactivará la cuenta según su situación actual,\n\n' +

        '¿Deseas continuar?',
      confirmText: 'Reactivar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.reactivating = true;

    try {
      await this.usuarioService.reactivar(id);
      await this.cargarUsuario(id);

      await this.notify.ok({
        variant: 'success',
        title: 'Usuario reactivado',
        message: 'El usuario fue reactivado correctamente.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.reactivating = false;
    }
  }
  async onEliminarDefinitivo(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;

    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Eliminar definitivamente',
      message:
        'Esta acción intentará borrar definitivamente la cuenta.\n\n' +
        'Solo se permitirá si el usuario no tiene actividad asociada.\n\n' +
        'Esta acción no se puede deshacer.\n\n' +
        '¿Deseas continuar?',
      confirmText: 'Eliminar definitivamente',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.purging = true;

    try {
      const res = await this.usuarioService.eliminarDefinitivo(id);

      await this.notify.ok({
        variant: 'success',
        title: 'Usuario eliminado definitivamente',
        message: res.message || 'Usuario eliminado definitivamente.',
        primaryText: 'Aceptar',
      });

      await this.router.navigate(['/admin/usuario/lista']);
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.purging = false;
    }
  }

  get puedeAutorizar(): boolean {
    return !!(
      this.usuario &&
      this.usuario.estado === 4 &&
      this.usuario.correoVerificado
    );
  }

  get puedeEditarRolManual(): boolean {
    return !!(
      this.usuario &&
      this.usuario.correoVerificado &&
      this.usuario.estado !== 0
    );
  }

  get puedeEditarEstadoManual(): boolean {
    return !!(
      this.usuario &&
      this.usuario.correoVerificado &&
      (this.usuario.estado === 1 || this.usuario.estado === 2)
    );
  }

  get puedeReenviarConfirmacionCorreo(): boolean {
    return !!(
      this.usuario &&
      !this.usuario.correoVerificado &&
      this.usuario.estado !== 0
    );
  }

  get puedeCorregirIdentidad(): boolean {
    return !!this.usuario;
  }

  get puedeEliminarSoft(): boolean {
    return !!(
      this.usuario &&
      this.usuario.estado !== 0
    );
  }

  get puedeEliminarDefinitivo(): boolean {
    return !!(
      this.usuario &&
      this.usuario.estado === 0
    );
  }
  get puedeReactivar(): boolean {
    return !!(
      this.usuario &&
      this.usuario.estado === 0
    );
  }
}

interface UsuarioDetalleForm {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  correoE: string;
  telefono: string;
  tz: string;
  fechaCreadoPorTexto: string;
  estado: EstadoUsuario | '';
  rolId: number | null;
}

interface UsuarioCorregirIdentidadFormLocal {
  dni: string;
  correoE: string;
  motivo: string;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

function formatDateTime(dt: Date | string | null | undefined): string {
  if (!dt) return '';

  const d = dt instanceof Date ? dt : new Date(dt);

  if (Number.isNaN(d.getTime())) return '';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}