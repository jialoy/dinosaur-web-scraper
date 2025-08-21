export interface DinosaurEntry {
  name: string;
  historicalPeriod: string;
  length: string;
  weight: string;
  diet: string;
  classification?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}
