// dropdown.component.ts
import { Component, Input, Output, EventEmitter, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-dropdown",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-container">
      <label class="dropdown-label">Select...</label>
      <div class="dropdown-trigger" (click)="toggleDropdown()" [class.open]="isOpen">
        <span class="selected-text">
          {{ selectedOption || "Choose an option" }}
        </span>
        <span class="arrow" [class.rotated]="isOpen">▼</span>
      </div>
      <div class="dropdown-menu" [class.visible]="isOpen" *ngIf="isOpen">
        <div class="dropdown-options">
          <div
            *ngFor="let option of options"
            class="option"
            [class.selected]="selectedOption === option"
            (click)="selectOption(option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./dropdown.component.scss"],
})
export class DropdownComponent {
  @Input() options: string[] = [];
  @Input() selectedOption: string = "";
  @Output() optionSelected = new EventEmitter<string>();

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: string): void {
    this.isOpen = false;
    this.selectedOption = option;
    this.optionSelected.emit(option);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown-container")) {
      this.isOpen = false;
    }
  }
}
