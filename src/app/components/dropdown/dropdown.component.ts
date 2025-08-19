import { Component, Input, Output, EventEmitter, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DinosaurEntry } from "../../../app/shared/types";

@Component({
  selector: "app-dropdown",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-container">
      <label class="dropdown-label">Select a Dinosaur:</label>
      <div class="dropdown-trigger" (click)="toggleDropdown()" [class.open]="isOpen">
        <span class="selected-text">
          {{ selectedDinosaur || "Choose a dinosaur" }}
        </span>
        <span class="arrow" [class.rotated]="isOpen">▼</span>
      </div>

      <div class="dropdown-menu" [class.visible]="isOpen" *ngIf="isOpen">
        <div class="dropdown-options">
          <div class="option" [class.selected]="!selectedDinosaur" (click)="selectOption(null)">
            &nbsp;
          </div>
          <div
            *ngFor="let dino of dinosaurs"
            class="option"
            [class.selected]="selectedDinosaur === dino.name"
            (click)="selectOption(dino)"
          >
            {{ dino.name }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./dropdown.component.scss"],
})
export class DropdownComponent {
  @Input() dinosaurs!: DinosaurEntry[];
  @Input() selectedDinosaur: string = "";
  @Output() dinosaurSelected = new EventEmitter<DinosaurEntry | null>();

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(dinosaur: DinosaurEntry | null): void {
    this.isOpen = false;
    this.selectedDinosaur = dinosaur ? dinosaur.name : "";
    this.dinosaurSelected.emit(dinosaur);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown-container")) {
      this.isOpen = false;
    }
  }
}
