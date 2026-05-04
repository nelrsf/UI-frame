import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MOCK_DASHBOARD_CARDS } from '../../fixtures';

@Component({
  selector: 'app-mock-dashboard',
  standalone: true,
  imports: [NgFor],
  templateUrl: './mock-dashboard.component.html',
})
export class MockDashboardComponent {
  readonly cards = MOCK_DASHBOARD_CARDS;
}
