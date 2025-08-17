import { Component, OnInit } from "@angular/core";
import { DinoDataFetchService } from "../../services/dinoDataFetch.service";

@Component({
  selector: "app-main-container",
  imports: [],
  templateUrl: "./main-container.html",
  styleUrl: "./main-container.scss"
})
export class MainContainer implements OnInit {
  constructor(private dinoDataFetchService: DinoDataFetchService) {}

  ngOnInit(): void {
    this.fetchDinoData();
  }

  fetchDinoData() {
    this.dinoDataFetchService.getDinosaurData().subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.error("Error fetching data", error);
      }
    );
  }
}
