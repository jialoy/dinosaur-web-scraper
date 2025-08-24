import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

interface DinosaurEntry {
    name: string;
    historicalPeriod: string;
    length: string;
    weight: string;
    diet: string;
}

@Injectable({
    providedIn: "root"
})
export class DinoDataFetchService {

    private apiUrl = "/api/scraper"; // Our scraper server endpoint

    constructor(private http: HttpClient) {}

    getDinosaurData(): Observable<DinosaurEntry[]> {
        return this.http.get<DinosaurEntry[]>(this.apiUrl);
    }
}