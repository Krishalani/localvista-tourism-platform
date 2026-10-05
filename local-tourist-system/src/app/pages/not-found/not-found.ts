import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="message">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <a class="button" routerLink="/">Browse attractions</a>
    </div>
  `,
})
export class NotFound {}
