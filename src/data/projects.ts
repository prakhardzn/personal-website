export interface ProjectFile {
  slug: string;
  fileNumber: string;
  title: string;
  category: string;
  year: string;
  role: string;
  status: string;
  summary: string;
  introduction: string;
  responsibilities: string[];
  accent: string;
  accentSoft: string;
}

export const projectFiles: ProjectFile[] = [
  {
    slug: "qaid",

    fileNumber: "FILE 001",

    title: "Qaid",

    category: "Psychological Thriller",

    year: "2025",

    role: "Director and DoP",

    status: "Completed",

    summary:
      "A psychological thriller about a man trapped inside a repeating cycle where time, memory and reality begin collapsing into one another.",

    introduction:
      "Qaid is a psychological thriller short film built around repetition, isolation and the fear of being unable to escape an event that has already happened.",

    responsibilities: [
      "Directed the short film and developed its visual treatment.",
      "Worked as the Director of Photography.",
      "Designed the visual language of the repeating time loop.",
      "Planned framing, lighting and camera movement.",
      "Worked on the title sequence and overall post-production direction.",
    ],

    accent: "#ff42b3",

    accentSoft: "rgb(255 66 179 / 14%)",
  },

  {
    slug: "kshitij",

    fileNumber: "FILE 002",

    title: "Kshitij",

    category: "Narrative Short Film",

    year: "2024",

    role: "Filmmaker",

    status: "Completed",

    summary:
      "A student photographs a balloon seller and is forced to confront questions of consent, representation and who gets to control another person's image.",

    introduction:
      "Kshitij is a narrative short film about photography, authorship and the ethical tension between documenting someone and turning their life into an image.",

    responsibilities: [
      "Developed the central story and character conflict.",
      "Planned the film's visual and narrative structure.",
      "Worked on the direction and production of the short film.",
      "Explored consent and representation through the camera.",
      "Developed the final emotional resolution.",
    ],

    accent: "#58dfff",

    accentSoft: "rgb(88 223 255 / 14%)",
  },

  {
    slug: "street-photography",

    fileNumber: "FILE 003",

    title: "Street Photography Archive",

    category: "Photography",

    year: "2024–2026",

    role: "Photographer",

    status: "Ongoing",

    summary:
      "An evolving archive of people, gestures, streets and everyday details photographed across Mumbai, Ahmedabad and Gujarat.",

    introduction:
      "The Street Photography Archive is an ongoing visual study of public spaces and ordinary moments that might otherwise disappear without being noticed.",

    responsibilities: [
      "Photographed people and public spaces in changing light conditions.",
      "Developed visual sequences from independent images.",
      "Explored observation, timing and environmental storytelling.",
      "Selected and edited photographs for cohesive presentation.",
      "Documented changing relationships between people and urban spaces.",
    ],

    accent: "#a8ff36",

    accentSoft: "rgb(168 255 54 / 13%)",
  },

  {
    slug: "jewish-ahmedabad-documentary",

    fileNumber: "FILE 004",

    title: "Jewish Ahmedabad",

    category: "Documentary Research",

    year: "2026",

    role: "Researcher and Filmmaker",

    status: "In Development",

    summary:
      "A documentary research project exploring Ahmedabad's Jewish community and the cultural history surrounding the Magen Abraham Synagogue.",

    introduction:
      "Jewish Ahmedabad investigates the history, memory and contemporary presence of a small community through its synagogue, personal stories and cultural records.",

    responsibilities: [
      "Researched the history of Ahmedabad's Jewish community.",
      "Studied the Magen Abraham Synagogue as a cultural location.",
      "Collected references for the documentary's visual treatment.",
      "Developed possible interview and narrative structures.",
      "Explored the relationship between architecture, memory and community.",
    ],

    accent: "#ffb84d",

    accentSoft: "rgb(255 184 77 / 14%)",
  },
];