import { Planet } from "@/types/astronomy";

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    symbol: "☿",
    color: "hsl(35, 30%, 60%)",
    size: 12,
    distance: "77 million km",
    visibleToNakedEye: true,
    facts: [
      "Smallest planet in our solar system",
      "A day on Mercury lasts 59 Earth days"
    ],
    orbitSpeed: 4.7
  },
  {
    id: "venus",
    name: "Venus",
    symbol: "♀",
    color: "hsl(45, 80%, 75%)",
    size: 18,
    distance: "38 million km",
    visibleToNakedEye: true,
    facts: [
      "Hottest planet in our solar system (465°C)",
      "Rotates backwards compared to most planets"
    ],
    orbitSpeed: 3.5
  },
  {
    id: "mars",
    name: "Mars",
    symbol: "♂",
    color: "hsl(15, 85%, 50%)",
    size: 16,
    distance: "225 million km",
    visibleToNakedEye: true,
    facts: [
      "Home to the largest volcano: Olympus Mons",
      "Has two small moons: Phobos and Deimos"
    ],
    orbitSpeed: 2.4
  },
  {
    id: "jupiter",
    name: "Jupiter",
    symbol: "♃",
    color: "hsl(25, 70%, 55%)",
    size: 32,
    distance: "628 million km",
    visibleToNakedEye: true,
    facts: [
      "Largest planet - could fit 1,300 Earths inside",
      "The Great Red Spot is a storm lasting 400+ years"
    ],
    orbitSpeed: 1.3
  },
  {
    id: "saturn",
    name: "Saturn",
    symbol: "♄",
    color: "hsl(45, 60%, 70%)",
    size: 28,
    distance: "1.2 billion km",
    visibleToNakedEye: true,
    facts: [
      "Famous for its stunning ring system",
      "Could float in water (if you had a big enough bathtub)"
    ],
    orbitSpeed: 0.97
  },
  {
    id: "uranus",
    name: "Uranus",
    symbol: "♅",
    color: "hsl(180, 50%, 65%)",
    size: 22,
    distance: "2.7 billion km",
    visibleToNakedEye: false,
    facts: [
      "Rotates on its side like a rolling ball",
      "Has 27 known moons named after Shakespeare characters"
    ],
    orbitSpeed: 0.68
  },
  {
    id: "neptune",
    name: "Neptune",
    symbol: "♆",
    color: "hsl(220, 70%, 55%)",
    size: 20,
    distance: "4.3 billion km",
    visibleToNakedEye: false,
    facts: [
      "Strongest winds in the solar system (2,100 km/h)",
      "Takes 165 Earth years to orbit the Sun"
    ],
    orbitSpeed: 0.54
  }
];
