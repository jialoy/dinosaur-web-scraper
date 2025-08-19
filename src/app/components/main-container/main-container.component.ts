import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DinoDataFetchService } from "../../services/dinoDataFetch.service";
import { DropdownComponent } from "../dropdown/dropdown.component";
import { DinosaurEntry } from "../../shared/types";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-main-container",
  imports: [DropdownComponent, CommonModule],
  templateUrl: "./main-container.html",
  styleUrls: ["./main-container.component.scss"],
})
export class MainContainer implements OnInit {
  dinosaurs: DinosaurEntry[] = [];
  selectedDinosaur: DinosaurEntry | null = null;
  selectedDinosaurName: string = "";

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
        this.selectedDinosaurName = dinosaurName;
        this.selectDinosaurByName = dinosaurName;
      } else {
        this.selectedDinosaur = null;
        this.selectedDinosaurName = "";
      }
    });
  }

  fetchDinoData() {
    this.dinoDataFetchService.getDinosaurData().subscribe(
      (data: DinosaurEntry[]) => {
        console.log(data);
        this.dinosaurs = data;
      },
      (error) => {
        console.error("Error fetching data", error);
      }
    );
  }

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

  private selectDinosaurByName(name: string): void {
    const dino = this.dinosaurs.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (dino) {
      this.selectedDinosaur = dino;
      console.log("Selected dinosaur from route:", dino);
    }
  }
}
