export type Marker = {
  label: string;
  position: [number, number, number];
  description: string;
};

export const markers: Marker[] = [
  {
    label: "Mount Everest",
    position: [-10, -2, 5],
    description: "Mount Everest (8848.86 m) – Nepal/China",
  },

  {
    label: "Makalu",
    position: [-15, -1, 5],
    description: "Makalu (8485 m) – Nepal/China",
  },
  {
    label: "Cho Oyu",
    position: [12.73, -2.83, -1.13],
    description: "Cho Oyu (8188 m) – Nepal/China",
  },

  {
    label: "Annapurna I",
    position: [-10, -1, 5],
    description: "Annapurna I (8091 m) – Nepal",
  },

];
