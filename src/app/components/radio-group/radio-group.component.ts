import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FilterOption } from "../../shared/types";

@Component({
  selector: "app-radio-group",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radio-group-container">
      <label class="radio-group-label">Filter dinosaurs by era:</label>
      <div class="radio-options">
        <div *ngFor="let option of options" class="radio-option">
          <input
            type="radio"
            [id]="'radio-' + option.value"
            [value]="option.value"
            [checked]="selectedValue === option.value"
            (change)="onSelectionChange(option.value)"
            class="radio-input"
          />
          <label [for]="'radio-' + option.value" class="radio-label">
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./radio-group.component.scss"],
})
export class RadioGroupComponent {
  @Input() options: FilterOption[] = [];
  @Input() selectedValue: string = "None";
  @Output() radioButtonSelected = new EventEmitter<string>();

  onSelectionChange(value: string): void {
    this.selectedValue = value;
    this.radioButtonSelected.emit(value);
  }
}
