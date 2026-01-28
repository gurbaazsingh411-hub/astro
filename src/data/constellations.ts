import { Constellation } from "@/types/astronomy";

// Real coordinates (simplified/approximated for major stars)
export const constellations: Constellation[] = [
  {
    id: "orion",
    name: "Orion",
    latinName: "Orion",
    mythology: "The Hunter - In Greek mythology, Orion was a giant huntsman placed among the stars by Zeus.",
    ra: 5.5,
    dec: 5,
    stars: [
      { ra: 5.92, dec: 7.41, brightness: 0.9 }, // Betelgeuse
      { ra: 5.42, dec: 6.35, brightness: 0.7 }, // Bellatrix
      { ra: 5.61, dec: -1.2, brightness: 0.6 }, // Alnilam (belt)
      { ra: 5.54, dec: -1.9, brightness: 0.6 },
      { ra: 5.68, dec: -1.0, brightness: 0.6 },
      { ra: 5.25, dec: -8.2, brightness: 0.85 }, // Rigel
      { ra: 5.79, dec: -9.6, brightness: 0.7 },  // Saiph
    ],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    id: "ursa-major",
    name: "Big Dipper",
    latinName: "Ursa Major",
    mythology: "The Great Bear - Zeus transformed the nymph Callisto into a bear to protect her from Hera's jealousy.",
    ra: 11,
    dec: 50,
    stars: [
      { ra: 11.06, dec: 61.75, brightness: 0.8 }, // Dubhe
      { ra: 11.03, dec: 56.38, brightness: 0.75 }, // Merak
      { ra: 11.89, dec: 53.69, brightness: 0.7 },  // Phecda
      { ra: 12.25, dec: 57.03, brightness: 0.7 },  // Megrez
      { ra: 12.9, dec: 55.96, brightness: 0.65 },  // Alioth
      { ra: 13.4, dec: 54.93, brightness: 0.7 },   // Mizar
      { ra: 13.79, dec: 49.31, brightness: 0.6 },  // Alkaid
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    latinName: "Cassiopeia",
    mythology: "The Queen - A vain queen who boasted about her beauty. Poseidon placed her in the sky.",
    ra: 1,
    dec: 60,
    stars: [
      { ra: 0.15, dec: 59.15, brightness: 0.7 },
      { ra: 0.67, dec: 56.54, brightness: 0.75 },
      { ra: 0.94, dec: 60.72, brightness: 0.8 },
      { ra: 1.43, dec: 60.18, brightness: 0.7 },
      { ra: 1.9, dec: 63.67, brightness: 0.65 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  }
];
