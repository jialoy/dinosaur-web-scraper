import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as d3 from "d3";
import { DataHandler } from "../../services/data-handler.service";
import { DinosaurEntry } from "../../shared/types";

@Component({
  selector: "app-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
})
export class ChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() data: DinosaurEntry[] = [];
  @Input() key: string = "length";

  private resizeObserver!: ResizeObserver;

  // Plot params
  private svg: any | null = null;
  private g: any | null = null;
  private margin = { top: 60, right: 100, bottom: 150, left: 60 };
  private width = 0;
  private height = 0;
  private resizeTimeout: any;

  constructor(private dataHandler: DataHandler, private elementRef: ElementRef) {}

  ngOnInit() {
    this.initialiseChart();
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.data?.length && this.key) {
        this.updateChartSize();
        this.renderChart(this.data, this.key);
      }
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeObserver.disconnect();
  }

  @HostListener("window:resize")
  onResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.updateChartSize();
      this.renderChart(this.data, this.key);
    }, 200); // Debounce
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"] || changes["key"]) {
      // Re-render the chart if data or key have changed
      this.renderChart(this.data, this.key);
    }
  }

  private initialiseChart() {
    // Get the container dimensions
    this.updateChartSize();

    // Create the SVG element
    this.svg = d3
      .select(this.elementRef.nativeElement)
      .select("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    // Create a group element for the chart content
    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  private updateChartSize() {
    const container = this.elementRef.nativeElement.parentElement;
    const containerWidth = container ? container.clientWidth : 800;

    const minWidth = 500;
    // if (containerWidth < minWidth) return;
    if (containerWidth < minWidth) {
      this.width = this.width || minWidth; // keep previous width
      this.height = this.height || 400; // keep previous height
    } else {
      this.width = containerWidth - this.margin.left - this.margin.right;
      // update height normally
    }

    // Calculate height based on number of data points
    const dataPointCount = this.data.length;
    const minBarHeight = 30; // Minimum height per bar
    const maxBarHeight = 60; // Maximum height per bar
    const minChartHeight = 500; // Minimum chart height
    const maxChartHeight = 1000; // Maximum chart height

    // Calculate ideal height based on data points
    let calculatedHeight = dataPointCount * minBarHeight;

    // If we have few data points, use a bit more space per bar
    if (dataPointCount <= 5) {
      calculatedHeight = dataPointCount * maxBarHeight;
    } else if (dataPointCount <= 10) {
      calculatedHeight = dataPointCount * 45; // Medium spacing
    }

    // Ensure height is within reasonable bounds
    this.height = Math.max(minChartHeight, Math.min(maxChartHeight, calculatedHeight));

    // Update margins
    this.margin.left = dataPointCount > 15 ? 100 : 80;

    if (this.svg) {
      this.svg
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
    }
  }

  private renderChart(data: DinosaurEntry[], key: string) {
    if (!this.svg || !this.g || !data || data.length === 0) return;

    const keyForData = key.toLowerCase() as keyof DinosaurEntry;
    const formattedData = this.dataHandler.formatDataForBarChart(data, keyForData);

    // Sort data in descending order
    formattedData.sort((a, b) => b.value - a.value);

    // Clear any existing chart content
    this.g.selectAll("*").remove();

    // Remove any existing tooltips
    d3.select("body").selectAll(".chart-tooltip").remove();

    // Set up scales (swapped for horizontal bars)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d: any) => d.value) || 0])
      .nice()
      .range([0, this.width]);

    const yScale = d3
      .scaleBand()
      .domain(formattedData.map((d) => d.name))
      .range([0, this.height])
      .padding(0.1);

    // Create tooltip div
    const tooltip = d3.select("body").append("div").attr("class", "chart-tooltip");

    // Create the bars
    this.g
      .selectAll(".bar")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: any) => yScale(d.name)!)
      .attr("width", 0) // Start with 0 width for animation
      .attr("height", yScale.bandwidth())
      .attr("fill", "#0c8b5b")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(800)
      .attr("width", (d: any) => xScale(d.value));

    // X axis
    this.g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.height})`)
      .attr("color", "#999")
      .call(d3.axisBottom(xScale));

    // Y axis
    const yAxis = this.g
      .append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(0)
          .tickFormat((d: string) => this.capitaliseStr(d))
      );
    yAxis.select("path").attr("stroke", "#999");

    // X axis label
    this.g
      .append("text")
      .attr("class", "x-label")
      .attr("transform", `translate(${this.width / 2}, ${this.height + this.margin.bottom - 100})`)
      .text(`${this.getYAxisLabel(key)} (${this.getUnit(key)})`);

    // Chart title
    this.g
      .append("text")
      .attr("class", "chart-title")
      .attr("x", 30)
      .attr("y", 0 - this.margin.top / 2)
      .text(`Dinosaur ${this.capitaliseStr(key)} Comparison`);

    // Add the tooltip
    this.g
      .selectAll(".bar")
      .on("mouseover", (event: MouseEvent, d: any) => {
        tooltip
          .html(
            `<div class="tooltip-content">
              <strong>${this.capitaliseStr(d.name)}</strong><br>
              ${this.getYAxisLabel(key)}: ${d.value.toLocaleString()} ${this.getUnit(key)}
            </div>`
          )
          .classed("tooltip-visible", true);
      })
      .on("mousemove", function (this: SVGRectElement, event: MouseEvent, d: any) {
        tooltip.style("left", event.pageX + 15 + "px").style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function (this: SVGRectElement, event: MouseEvent, d: any) {
        d3.select(this).classed("bar-hover", false);

        tooltip.classed("tooltip-visible", false);
      });
  }

  private getYAxisLabel(key: string): string {
    const keyLabels: { [key: string]: string } = {
      length: "Length",
      weight: "Weight",
    };
    return keyLabels[key.toLowerCase()] || this.capitaliseStr(key);
  }

  private getUnit(key: string): string {
    const keyUnits: { [key: string]: string } = {
      length: "ft",
      weight: "pounds",
    };
    return keyUnits[key.toLowerCase()];
  }

  private capitaliseStr(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
