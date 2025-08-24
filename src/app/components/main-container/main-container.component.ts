import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DinoDataFetchService } from "../../services/dino-data-fetch";
import { TabsComponent } from "../tabs/tabs.component";
import { DropdownComponent } from "../dropdown/dropdown.component";
import { CardComponent } from "../card/card.component";
import { ChartComponent } from "../chart/chart.component";
import { RadioGroupComponent } from "../radio-group/radio-group.component";
import { DinosaurEntry, FilterOption } from "../../shared/types";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-main-container",
  imports: [
    TabsComponent,
    DropdownComponent,
    CardComponent,
    ChartComponent,
    RadioGroupComponent,
    CommonModule,
  ],
  templateUrl: "./main-container.html",
  styleUrls: ["./main-container.component.scss"],
})
export class MainContainer implements OnInit {
  activeTab: "Card" | "Chart" = "Card";

  dinosaurs: DinosaurEntry[] = [];
  filteredDinosaurs: DinosaurEntry[] = []; // After radio filters are applied

  selectedDinosaur: DinosaurEntry | null = null;
  selectedPeriodFilter: string = "None"; // Default no period filtering on dinosaurs
  selectedClassificationFilter: string = "None"; // Default no classification filtering on dinosaurs

  chartOptions = ["Length", "Weight"];
  selectedChart: string = "";

  private routeDinosaurName: string = "";

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
      const chartOption = params["chartOption"];

      if (dinosaurName) {
        this.activeTab = "Card";
        this.routeDinosaurName = dinosaurName;
        this.setSelectedDinosaur(dinosaurName);
      } else if (chartOption) {
        this.activeTab = "Chart";
        this.selectedChart = chartOption.toLowerCase();
      } else {
        this.selectedDinosaur = null;
        this.selectedChart = "";
      }
    });
  }

  fetchDinoData(): void {
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
   * Getter to derive dinosaur dropdown options
   */
  get dinosaurOptions(): string[] {
    return this.filteredDinosaurs.map((d) => d.name);
  }

  onTabChange(tab: string): void {
    if (tab !== "Card" && tab !== "Chart") return;
    this.activeTab = tab;

    this.updateUrlForTab();
  }

  onPeriodFilterChanged(selectedPeriod: string): void {
    this.selectedPeriodFilter = selectedPeriod;
    this.applyFilters();
    this.syncSelectionWithFilters();
  }

  onClassificationFilterChanged(selectedClassification: string): void {
    this.selectedClassificationFilter = selectedClassification;
    this.applyFilters();
    this.syncSelectionWithFilters();
  }

  onDinosaurSelected(dinosaurName: string): void {
    this.selectedDinosaur = this.filteredDinosaurs.find((d) => d.name === dinosaurName) || null;
    this.updateUrlForTab();
  }

  onChartSelected(option: string): void {
    this.selectedChart = option;
    this.updateUrlForTab();
  }

  /**
   * Filter the dinosaur entries based on selected period and classification filters.
   */
  private applyFilters(): void {
    let filtered = [...this.dinosaurs];

    if (this.selectedPeriodFilter !== "None") {
      filtered = filtered.filter((d) =>
        d.historicalPeriod.toLowerCase().includes(this.selectedPeriodFilter.toLowerCase())
      );
    }

    if (this.selectedClassificationFilter !== "None") {
      filtered = filtered.filter((d) =>
        d.classification?.toLowerCase().includes(this.selectedClassificationFilter.toLowerCase())
      );
    }

    this.filteredDinosaurs = filtered;
    console.log(this.filteredDinosaurs);
  }

  /**
   * Check if the currently selected dinosaur or chart option is still valid after new filters are
   * applied, and reset selectedDinosaur or selectedChart if it should be filtered out (in the case
   * of dinosaur) or there is no filtered data to display (in the case of chart).
   */
  private syncSelectionWithFilters(): void {
    if (
      this.selectedDinosaur &&
      !this.filteredDinosaurs.some((d) => d.name === this.selectedDinosaur!.name)
    ) {
      this.selectedDinosaur = null;
    }

    if (this.activeTab === "Chart" && this.filteredDinosaurs.length === 0) {
      this.selectedChart = "";
    }

    this.updateUrlForTab();
  }

  /**
   * Handle routing in each tab.
   */
  private updateUrlForTab(): void {
    let routePath: string[] = [];
    if (this.activeTab === "Card") {
      if (this.selectedDinosaur) {
        routePath = ["card", this.selectedDinosaur.name.toLowerCase()];
      } else {
        routePath = [""];
      }
    } else if (this.activeTab === "Chart") {
      if (this.selectedChart && this.filteredDinosaurs.length > 0) {
        routePath = ["chart", this.selectedChart.toLowerCase()];
      } else {
        routePath = [""];
      }
    }
    this.router.navigate(routePath);
  }

  private setSelectedDinosaur(dinosaurName: string): void {
    const dinosaur = this.dinosaurs.find(
      (d) => d.name.toLowerCase() === dinosaurName.toLowerCase()
    );
    if (dinosaur) this.selectedDinosaur = dinosaur;
  }
}
