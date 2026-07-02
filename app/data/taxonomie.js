export const themes = [
  {
    theme: "Eenzaamheid en sociale isolatie",
    domain: "Sociale verbondenheid",
    signals: "Somberheid, gevoelens van leegte, gebrek aan plezier, slaapproblemen, piekeren, gevoel er alleen voor te staan, frequente consulten zonder duidelijke medische oorzaak, behoefte aan aandacht of gesprek."
  },
  {
    theme: "Financiële stress",
    domain: "Financiële bestaanszekerheid",
    signals: "Chronische stress, piekeren, angstklachten, slaapproblemen, concentratieproblemen, hoofdpijn, vermoeidheid, lichamelijke spanningsklachten, gevoelens van machteloosheid."
  },
  {
    theme: "Werk- en participatieproblemen",
    domain: "Werk en maatschappelijke participatie",
    signals: "Stress, burn-outklachten, somberheid, verlies van zelfvertrouwen, gebrek aan dagstructuur, gevoelens van nutteloosheid, motivatieproblemen, angst voor werkhervatting of baanverlies."
  },
  {
    theme: "Mantelzorgbelasting",
    domain: "Mantelzorg en zorgbelasting",
    signals: "Vermoeidheid, overbelasting, stress, slaapproblemen, prikkelbaarheid, somberheid, schuldgevoelens, lichamelijke uitputting, gevoelens van geen tijd meer voor zichzelf hebben."
  },
  {
    theme: "Gezins- en relatieproblemen",
    domain: "Gezin en sociale relaties",
    signals: "Stress, angst, somberheid, slaapproblemen, concentratieproblemen, spanningsklachten, gevoelens van onveiligheid, opvoedstress, conflicten thuis."
  },
  {
    theme: "Verlies, rouw en zingeving",
    domain: "Verlies, rouw en zingeving",
    signals: "Verdriet, somberheid, slapeloosheid, concentratieproblemen, gevoelens van leegte, verlies van richting, existentiële vragen, gebrek aan motivatie of levenslust."
  },
  {
    theme: "Wonen en bestaanszekerheid",
    domain: "Wonen en leefomgeving",
    signals: "Stress, angst, piekeren, slaapproblemen, gevoelens van onzekerheid, psychosomatische klachten, zorgen over huisvesting, dreigende dakloosheid of onveilige woonomstandigheden."
  },
  {
    theme: "Leefstijl en fysieke gezondheid",
    domain: "Leefstijl en fysieke gezondheid",
    signals: "Vermoeidheid, stress, somberheid, gebrek aan energie, slaapproblemen, bewegingsarmoede, ongezonde leefgewoonten, verminderd functioneren in dagelijks leven."
  },
  {
    theme: "Psychische veerkracht en zelfregie",
    domain: "Veerkracht en zelfregie",
    signals: "Moeite met omgaan met tegenslagen, stressgevoeligheid, lichte angst- of stemmingsklachten, gebrek aan zelfvertrouwen, gevoelens van controleverlies, onzekerheid, moeite met grenzen stellen."
  }
];

export const goalsByDomain = {
  "Sociale verbondenheid": [
    "Sociale verbondenheid versterken",
    "Participatie vergroten",
    "Dagstructuur versterken",
    "Veerkracht en zelfregie versterken"
  ],
  "Financiële bestaanszekerheid": [
    "Financiële stabiliteit vergroten",
    "Woon- en leefsituatie stabiliseren",
    "Veerkracht en zelfregie versterken"
  ],
  "Werk en maatschappelijke participatie": [
    "Participatie vergroten",
    "Dagstructuur versterken",
    "Veerkracht en zelfregie versterken"
  ],
  "Mantelzorg en zorgbelasting": [
    "Belasting verminderen",
    "Veerkracht en zelfregie versterken"
  ],
  "Gezin en sociale relaties": [
    "Relaties versterken",
    "Belasting verminderen",
    "Veerkracht en zelfregie versterken"
  ],
  "Verlies, rouw en zingeving": [
    "Verlies verwerken en betekenis hervinden",
    "Veerkracht en zelfregie versterken"
  ],
  "Wonen en leefomgeving": [
    "Woon- en leefsituatie stabiliseren",
    "Financiële stabiliteit vergroten"
  ],
  "Leefstijl en fysieke gezondheid": [
    "Gezonde leefstijl bevorderen",
    "Dagstructuur versterken",
    "Veerkracht en zelfregie versterken"
  ],
  "Veerkracht en zelfregie": [
    "Veerkracht en zelfregie versterken"
  ]
};

export const interventionsByGoal = {
  "Sociale verbondenheid versterken": [
    "Maatjescontact",
    "Buddyproject",
    "Ontmoetingsgroep",
    "Lotgenotengroep",
    "Buurtactiviteiten",
    "Wandelgroep"
  ],
  "Participatie vergroten": [
    "Participatiecoaching",
    "Vrijwilligerswerktoeleiding",
    "Werkervaringsplaats",
    "Arbeidsmatige dagbesteding",
    "Maatschappelijke dagbesteding"
  ],
  "Dagstructuur versterken": [
    "Dagbesteding",
    "Welzijnscoaching",
    "Activering",
    "Sportprogramma",
    "Wandelgroep"
  ],
  "Veerkracht en zelfregie versterken": [
    "Welzijnscoaching",
    "Zelfregietraining",
    "Stressmanagement",
    "Assertiviteitstraining",
    "Herstelgroep",
    "Ervaringsdeskundige begeleiding"
  ],
  "Financiële stabiliteit vergroten": [
    "Schuldhulpverlening",
    "Budgetcoaching",
    "Budgetbeheer",
    "Formulierenhulp",
    "Hulp bij aanvragen van voorzieningen"
  ],
  "Woon- en leefsituatie stabiliseren": [
    "Woonbegeleiding",
    "Woonadvies",
    "Wmo ondersteuning",
    "Cliëntondersteuning",
    "Maatschappelijk werk"
  ],
  "Belasting verminderen": [
    "Mantelzorgcoaching",
    "Mantelzorgadvies",
    "Mantelzorggroep",
    "Respijtzorg",
    "Vervangende mantelzorg"
  ],
  "Relaties versterken": [
    "Gezinscoaching",
    "Gezinsgesprekken",
    "Relatieondersteuning",
    "Scheidingsondersteuning",
    "Opvoedadvies"
  ],
  "Verlies verwerken en betekenis hervinden": [
    "Rouwbegeleiding",
    "Rouwgroep",
    "Lotgenotengroep",
    "Zingevingsgesprek",
    "Geestelijke begeleiding"
  ],
  "Gezonde leefstijl bevorderen": [
    "Leefstijlcoaching",
    "Gecombineerde leefstijlinterventie",
    "Buurtsportcoach",
    "Beweeggroep",
    "Voedingsprogramma"
  ]
};

export const municipalities = [
  "Aalten","Alkmaar","Almere","Amersfoort","Amsterdam","Apeldoorn","Arnhem","Assen",
  "Breda","Delft","Den Haag","Deventer","Dordrecht","Ede","Eindhoven","Emmen",
  "Enschede","Gouda","Groningen","Haarlem","Haarlemmermeer","Heerenveen","Helmond",
  "Hengelo","Leeuwarden","Leiden","Maastricht","Nijmegen","Rotterdam","Tilburg",
  "Utrecht","Venlo","Zaanstad","Zwolle"
];
