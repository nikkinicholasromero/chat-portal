import {Component, inject} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NgIf} from "@angular/common";
import {OverlayComponent} from "./components/overlay.component";
import {StateService} from "./shared/service/state.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    OverlayComponent],
  template: `
    <div class="container mx-auto px-4 bg-white h-dvh shadow-neutral-200 shadow-2xl">
        <app-overlay *ngIf="stateService.loading()"></app-overlay>
        <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  stateService = inject(StateService);
}
