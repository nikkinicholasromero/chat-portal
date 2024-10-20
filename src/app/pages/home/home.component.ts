import {Component} from "@angular/core";
import {HeaderComponent} from "../../components/header.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class HomeComponent {
}
