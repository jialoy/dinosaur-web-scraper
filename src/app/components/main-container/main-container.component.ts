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
  selectedPeriodFilter: string = "None"; // Default no filtering on dinosaurs
  private routeDinosaurName: string = ""; // To store dinosaur name for route parameter handling

  periodFilterOptions: FilterOption[] = [
    { value: "None", label: "None" },
    { value: "Triassic", label: "Triassic" },
    { value: "Jurassic", label: "Jurassic" },
    { value: "Cretaceous", label: "Cretaceous" },
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
        this.applyPeriodFilter();

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
    this.applyPeriodFilter();

    // Handle update if period filter option is changed and the already-selected dinosaur is not
    // part of the filtered group (clear selection and navigate home)
    if (
      this.selectedDinosaur &&
      !this.filteredDinosaurs.some((dino) => dino.name === this.selectedDinosaur?.name)
    ) {
      // Current selection is filtered out, clear it and navigate to home
      this.selectedDinosaur = null;

      // Use setTimeout to ensure the change detection cycle completes
      setTimeout(() => {
        this.router.navigate([""]);
      }, 0);
    }
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
   * Filter the dinosaur entries based on the selected option in the period filter.
   */
  applyPeriodFilter(): void {
    if (this.selectedPeriodFilter === "None") {
      this.filteredDinosaurs = [...this.dinosaurs];
    } else {
      this.filteredDinosaurs = this.dinosaurs.filter((dinosaur) =>
        dinosaur.historicalPeriod.toLowerCase().includes(this.selectedPeriodFilter.toLowerCase())
      );
    }
    console.log(this.filteredDinosaurs);
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
