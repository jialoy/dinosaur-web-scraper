import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DinoDataFetchService } from "../../services/dinoDataFetch.service";
import { DropdownComponent } from "../dropdown/dropdown.component";
import { CardComponent } from "../card/card.component";
import { DinosaurEntry } from "../../shared/types";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-main-container",
  imports: [DropdownComponent, CardComponent, CommonModule],
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

      // this.displayDinosaurInfo(dinosaur.name);
    } else {
      console.log("No dinosaur selected");
      // Navigate back to home
      this.router.navigate([""]);
    }
  }

  // private displayDinosaurInfo(name: string): void {
  //   const dinosaurEntry = this.dinosaurs.find(
  //     (dino) => dino.name.toLowerCase() === name.toLowerCase()
  //   );
  //   console.log("Placeholder function to show info for", name);
  //   // console.log(dinosaurEntry);
  // }
}
