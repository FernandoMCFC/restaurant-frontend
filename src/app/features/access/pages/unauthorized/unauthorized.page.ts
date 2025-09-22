import { Component } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-unauthorized',
  template: `<div style="padding:24px"><h2>Sin permiso</h2><p>No tienes permisos para acceder a esta sección.</p></div>`
})
export class UnauthorizedPage {}
