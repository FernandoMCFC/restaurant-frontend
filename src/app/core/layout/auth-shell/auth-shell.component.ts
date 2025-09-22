import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-shell',
  imports: [CommonModule, RouterOutlet],
  template: `
    <section class="auth-shell">
      <!-- Panel izquierdo (formulario) -->
      <div class="left">
        <div class="left-inner">
          <div class="brand">
            <img
              src="/branding/company-logo.svg"
              alt="Logo"
              class="logo"
              draggable="false"
            />
          </div>

          <!-- CARD -->
          <div class="auth-card">
            <div class="auth-card-body">
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho -->
      <div class="right">
        <div class="right-mask"></div>
        <div class="right-grid"></div>
        <div class="right-content">
          <h2>Bienvenido a la Web App Restaurant</h2>
          <p>Organiza tus restaurantes con dashboards modernos y módulos claros. Instálala como app (PWA) y úsala offline.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host{ display:block; }

    /* Layout dos paneles; en móvil apilado y oculto derecha */
    .auth-shell{
      min-height: 100dvh;
      display: grid;
      grid-template-columns: 1fr;
    }
    @media (min-width: 1024px){
      .auth-shell{ grid-template-columns: 1fr 1fr; }
    }

    /* ===== IZQUIERDA ===== */
    .left{
      display: grid;
      place-items: center;
      padding: 0;
      background: #fff;
    }
    .left-inner{
      width: 100%;
      display: grid;
      gap: 16px;
      justify-items: start;
    }
    .brand{ margin-bottom: 8px; }
    .logo{
      height: 64px;
      width: auto;
      user-select: none;
    }

    /* ESCRITORIO: recupera contenedor izquierdo */
    @media (min-width: 1024px){
      .left{ padding: clamp(16px, 3vw, 32px); }
      .left-inner{ width: min(92%, 920px); }
    }

    /* ===== CARD plano ===== */
    .auth-card{
      width: 100%;
      margin: 0;
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      max-width: 100%;
    }
    .auth-card-body{
      /* padding interno para que el contenido respire */
      padding: 28px 24px;
    }
    @media (min-width: 768px){
      .auth-card-body{ padding: 36px 40px; }
    }

    /* ===== DERECHA ===== */
    .right{
      display: none; /* MÓVIL: oculto */
      position: relative;
      overflow: hidden;

      /* ▶️ COLOR ACTUALIZADO: más vivo con tu paleta */
      background:
        radial-gradient(1000px 700px at 70% 30%, rgba(124, 58, 237, .45), rgba(124, 58, 237, 0) 60%),
        linear-gradient(135deg, var(--p-primary-800), var(--p-primary-600));

      color: #fff;
      place-items: center;
      padding: clamp(24px, 5vw, 48px);
    }
    @media (min-width: 1024px){
      .right{ display: grid; } /* SOLO escritorio */
    }
    .right-mask{
      position:absolute; inset:0;
      background: linear-gradient(180deg, rgba(255,255,255,.05), transparent 30%),
                  linear-gradient(0deg, rgba(255,255,255,.05), transparent 30%);
      pointer-events:none;
    }
    .right-grid{
      position:absolute; inset:0;
      background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);
      background-size: 22px 22px;
      opacity:.25; pointer-events:none;
    }
    .right-content{
      position: relative; z-index: 1;
      max-width: 680px;
      text-align: center;
    }
    .right-content h2{
      font-size: clamp(36px, 5vw, 64px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.01em;
      margin: 0 0 12px;
    }
    .right-content p{
      font-size: clamp(14px, 1.1vw, 16px);
      opacity:.9;
      margin: 0;
    }

    .logo{
      height: 88px;         /* antes: 64px */
      width: auto;
      user-select: none;
    }
    @media (min-width: 768px){
      .logo{ height: 104px; }
    }
    @media (min-width: 1280px){
      .logo{ height: 128px; }  /* tamaño cómodo en desktop grande */
    }

    /* Usa la misma sangría (padding-x) para el logo y para el contenido del card */
    .left-inner{ --card-xp: 24px; }                    /* móvil */
    .auth-card-body{ padding: 28px var(--card-xp); }   /* ya no 28px 24px */
    .brand{ padding-left: var(--card-xp); }            /* alinea el logo con el H1 */

    /* En tablet/desktop aumenta la sangría y siguen alineados */
    @media (min-width: 768px){
      .left-inner{ --card-xp: 40px; }
      .auth-card-body{ padding: 36px var(--card-xp); } /* ya no 36px 40px */
    }
  `]
})
export class AuthShellComponent {}
