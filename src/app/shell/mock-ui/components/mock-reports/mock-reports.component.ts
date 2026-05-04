import { Component } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';
import { MOCK_REPORT_ROWS } from '../../fixtures';

@Component({
  selector: 'app-mock-reports',
  standalone: true,
  imports: [NgFor, DatePipe],
  templateUrl: './mock-reports.component.html',
})
export class MockReportsComponent {
  readonly rows = MOCK_REPORT_ROWS;
}
