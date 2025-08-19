import { Routes } from "@angular/router";
import { MainContainer } from "./components/main-container/main-container.component";

export const routes: Routes = [
  {
    path: "",
    component: MainContainer,
  },
  {
    path: ":dinosaurName",
    component: MainContainer,
  },
  {
    path: "**",
    redirectTo: "",
  },
];
