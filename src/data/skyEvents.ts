import { SkyEvent } from "@/types/astronomy";

export const skyEvents: SkyEvent[] = [
    {
        id: "perseids-2024",
        title: "Perseid Meteor Shower Peak",
        date: new Date("2024-08-12T22:00:00"),
        type: "meteor-shower",
        description: "One of the most popular meteor showers, known for fast and bright meteors."
    },
    {
        id: "lunar-eclipse-sept-2024",
        title: "Partial Lunar Eclipse",
        date: new Date("2024-09-18T02:44:00"),
        type: "eclipse",
        description: "Visible from Europe, Africa, North and South America."
    },
    {
        id: "jupiter-opposition-2024",
        title: "Jupiter at Opposition",
        date: new Date("2024-12-07T00:00:00"),
        type: "opposition",
        description: "Jupiter will be at its closest and brightest, visible all night long."
    },
    {
        id: "geminids-2024",
        title: "Geminid Meteor Shower",
        date: new Date("2024-12-14T20:00:00"),
        type: "meteor-shower",
        description: "The King of meteor showers, often producing 120 multicolored meteors per hour."
    }
];
