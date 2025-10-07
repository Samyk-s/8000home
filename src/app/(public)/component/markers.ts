export type Marker = {
  label: string;
  position: [number, number, number];
  description: string;
};

export const markers: Marker[] = [
  {
    label: "Mount Everest",
    position: [-6.94, -0.67, 3.03],
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
    position: [-11.20, -1.02, 4.92],
    description: "Annapurna I (8091 m) – Nepal",
  },

{
    label: "Mt. Lhotse",
    position: [-4.66, -0.66, -5.14],
    description: "Annapurna I (8091 m) – Nepal",
  },
{
    label: "Mt. K2",
    position:   [-9.59, -1.75, -10.33],
    description: "Annapurna I (8091 m) – Nepal",
  },
];
