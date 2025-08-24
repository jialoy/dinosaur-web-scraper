import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-tabs",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./tabs.component.html",
  styleUrls: ["./tabs.component.scss"],
})
export class TabsComponent {
  @Input() tabs: string[] = [];
  @Input() activeTab: string = "";
  @Output() tabSelected = new EventEmitter<string>();

  onTabClick(tab: string): void {
    this.tabSelected.emit(tab);
  }
}
