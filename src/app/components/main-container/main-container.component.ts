import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DinoDataFetchService } from "../../services/dinoDataFetch.service";
import { DropdownComponent } from "../dropdown/dropdown.component";
import { CardComponent } from "../card/card.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { DinosaurEntry, FilterOption } from "../../shared/types";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-main-container",
  imports: [DropdownComponent, CardComponent, RadioGroupComponent, CommonModule],
  templateUrl: "./main-container.html",
  styleUrls: ["./main-container.component.scss"],
})
export class MainContainer implements OnInit {
  dinosaurs: DinosaurEntry[] = [];
  filteredDinosaurs: DinosaurEntry[] = []; // After radio filter is applied
  selectedDinosaur: DinosaurEntry | null = null;
  selectedPeriodFilter: string = "None"; // Default no period filtering on dinosaurs
  selectedClassificationFilter: string = "None"; // Default no classification filtering on dinosaurs
  private routeDinosaurName: string = ""; // To store dinosaur name for route parameter handling

  periodFilterOptions: FilterOption[] = [
    { value: "None", label: "None" },
    { value: "Triassic", label: "Triassic" },
    { value: "Jurassic", label: "Jurassic" },
    { value: "Cretaceous", label: "Cretaceous" },
  ];

  classificationFilterOptions: FilterOption[] = [
    { value: "None", label: "None" },
    { value: "Theropoda", label: "Theropoda" },
    { value: "Sauropodomorpha", label: "Sauropodomorpha" },
    { value: "Ornithischia", label: "Ornithischia" },
  ];

  constructor(
    private dinoDataFetchService: DinoDataFetchService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchDinoData();

    this.route.params.subscribe((params) => {
      const dinosaurName = params["dinosaurName"];
      if (dinosaurName) {
        // Set routeDinosaurName param to use when updating the route
        this.routeDinosaurName = dinosaurName;
        // Set the dinosaur object based on the route parameter
        this.setSelectedDinosaur(dinosaurName);
      } else {
        // Clear selectedDinosaur when there is no route parameter
        this.selectedDinosaur = null;
      }
    });
  }

  fetchDinoData() {
    this.dinoDataFetchService.getDinosaurData().subscribe(
      (data: DinosaurEntry[]) => {
        this.dinosaurs = data;
        this.applyFilters();

        if (this.routeDinosaurName) {
          this.setSelectedDinosaur(this.routeDinosaurName);
        }
      },
      (error) => {
        console.error("Error fetching data", error);
      }
    );
  }

  /**
   * Getter to derive dinosaur name
   */
  get selectedDinosaurName(): string {
    return this.selectedDinosaur ? this.selectedDinosaur.name : "";
  }

  /**
   * Filter dinosaur entries by calling applyFilter when a selection is made in the period filter.
   */
  onPeriodFilterChanged(selectedPeriod: string): void {
    this.selectedPeriodFilter = selectedPeriod;
    this.applyFilters();
    this.handleFilteredSelectionUpdate();
  }

  onClassificationFilterChanged(selectedClassification: string): void {
    this.selectedClassificationFilter = selectedClassification;
    this.applyFilters();
    this.handleFilteredSelectionUpdate();
  }

  /**
   * Navigate to the correct route based on user's selected dinousaur
   */
  onDinosaurSelected(dinosaur: DinosaurEntry | null): void {
    this.selectedDinosaur = dinosaur;

    if (dinosaur) {
      console.log("Selected dinosaur:", dinosaur);
      // Navigate to the dinosaur route
      const dinosaurPath = dinosaur.name.toLowerCase();
      this.router.navigate([dinosaurPath]);
    } else {
      console.log("No dinosaur selected");
      // Navigate back to home
      this.router.navigate([""]);
    }
  }

  /**
   * Filter the dinosaur entries based on selected period and classification filters.
   */
  private applyFilters(): void {
    let filtered = [...this.dinosaurs];

    // Apply period filter
    if (this.selectedPeriodFilter !== "None") {
      filtered = filtered.filter((dinosaur) =>
        dinosaur.historicalPeriod.toLowerCase().includes(this.selectedPeriodFilter.toLowerCase())
      );
    }

    // Apply classification filter
    if (this.selectedClassificationFilter !== "None") {
      filtered = filtered.filter((dinosaur) =>
        dinosaur.classification
          ?.toLowerCase()
          .includes(this.selectedClassificationFilter.toLowerCase())
      );
    }

    this.filteredDinosaurs = filtered;
    console.log("Filtered dinosaurs:", this.filteredDinosaurs);
  }

  /**
   * Handle updating the selected dinosaur when filters change.
   */
  private handleFilteredSelectionUpdate(): void {
    // Check if current selection is still valid after filtering
    if (
      this.selectedDinosaur &&
      !this.filteredDinosaurs.some((dino) => dino.name === this.selectedDinosaur?.name)
    ) {
      // If current selection is filtered out, clear it and navigate to home
      this.selectedDinosaur = null;

      // Use setTimeout to ensure the change detection cycle completes
      setTimeout(() => {
        this.router.navigate([""]);
      }, 0);
    }
  }

  private setSelectedDinosaur(dinosaurName: string): void {
    const dinosaur = this.dinosaurs.find(
      (dino) => dino.name.toLowerCase() === dinosaurName.toLowerCase()
    );

    if (dinosaur) {
      this.selectedDinosaur = dinosaur;
    }
  }
}
