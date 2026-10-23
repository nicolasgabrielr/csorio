import type { Guest, Confirmation } from "./supabase";

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Persiste entre re-evaluaciones del módulo en Next.js dev
export type Prices = {
  adult_cost: number;
  over12_cost: number;
  under12_cost: number;
};


declare global {
  // eslint-disable-next-line no-var
  var __mockGuests: Guest[] | undefined;
  // eslint-disable-next-line no-var
  var __mockConfirmations: Confirmation[] | undefined;
  // eslint-disable-next-line no-var
  var __mockPrices: Prices | undefined;
  // eslint-disable-next-line no-var
  var __mockSettings: Record<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __mockGuestsMigration: number | undefined;
  // eslint-disable-next-line no-var
  var __mockGuestPhotos: import("@/actions/guest-photos").GuestPhoto[] | undefined;
}

if (!globalThis.__mockGuests) {
  globalThis.__mockGuests = [
  {
    "id": "guest-adrian",
    "full_name": "Adrian Albarracin",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Patri",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Juanda",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Guadalupe",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-adriano",
    "full_name": "Adriano Marticorena",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Oriana",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-agustin-ag",
    "full_name": "Agustin Aguero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-agustin-b",
    "full_name": "Agustin Balocco",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Meli",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Bruno",
        "type": "under5",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-agustin-g",
    "full_name": "Agustin Gatto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-agustin-l",
    "full_name": "Agustin Lopez Nuñez",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 0
  },
  {
    "id": "guest-agustina-b",
    "full_name": "Agustina Basualdo",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-ana-z",
    "full_name": "Ana Zamparutti",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Ludmila",
        "type": "over12",
        "cost": 30000
      },
      {
        "name": "Joaquin",
        "type": "under5",
        "cost": 0
      },
      {
        "name": "Valentin",
        "type": "over12",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-analia",
    "full_name": "Analia Canavesio",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Roberto",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Camila",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Mateo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Magali",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Valentin",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-analia-p",
    "full_name": "Analia Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Luciano Di Gennaro",
        "type": "adult",
        "cost": 0
      },
      {
        "name": "Emi",
        "type": "over12",
        "cost": 0
      },
      {
        "name": "Santi",
        "type": "under12",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-antonela",
    "full_name": "Antonela Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Marcos",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-augusto",
    "full_name": "Augusto Santarelli",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-carlos-z",
    "full_name": "Carlos Zuffolo",
    "allows_companion": true,
    "max_adults": 2,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Agustin",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Mateo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Carla",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-cristian-f",
    "full_name": "Cristian Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-daiana",
    "full_name": "Daiana Ferreyra",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Meli",
        "type": "over12",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-diego",
    "full_name": "Diego Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Juli Filippa",
        "type": "adult",
        "cost": 0
      },
      {
        "name": "Charo Fornero",
        "type": "under5",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-eliana",
    "full_name": "Eliana Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Lolo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Emanuel",
        "type": "over12",
        "cost": 30000
      },
      {
        "name": "Agustina",
        "type": "under12",
        "cost": 20000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-elsa",
    "full_name": "Elsa Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Juan",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-emanual",
    "full_name": "Emanual Zamparutti",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Silvina",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Facundo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Agustin",
        "type": "over12",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-emanuel-l",
    "full_name": "Emanuel Lucero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-emiliano-p",
    "full_name": "Emiliano Platinetti",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Emi",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-emiliano-r",
    "full_name": "Emiliano Rinaldini",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Pao",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-enzo",
    "full_name": "Enzo Casalegno",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Cami Mana",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-fernando",
    "full_name": "Fernando Bustos",
    "allows_companion": true,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 3,
    "over12_cost": 65000,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Susana",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-flavio",
    "full_name": "Flavio Leonel Pietrolati",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 0
  },
  {
    "id": "guest-florencia",
    "full_name": "Florencia Gil",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-georgina",
    "full_name": "Georgina Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Juanjo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Noah",
        "type": "under5",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-gimena",
    "full_name": "Gimena Morales",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Renzo",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-graciela",
    "full_name": "Graciela Carena",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-guillermo",
    "full_name": "Guillermo Medina",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-gustavo",
    "full_name": "Gustavo Laboulaye",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-hugo",
    "full_name": "Hugo Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Clelia",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-ignacio-e",
    "full_name": "Ignacio Escudero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-ignacio-s",
    "full_name": "Ignacio Suarez",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-jesica-b",
    "full_name": "Jesica Balestro",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-jesica",
    "full_name": "Jesica Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Nicolás Aguirre",
        "type": "adult",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-jose",
    "full_name": "Jose Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Miriam",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-josepedro",
    "full_name": "Jose Pedro Montejano",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-josefina",
    "full_name": "Josefina Antinori",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-josefina-re",
    "full_name": "Josefina Re",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Anita",
        "type": "over12",
        "cost": 20000
      },
      {
        "name": "Pedro",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-juan-c",
    "full_name": "Juan Chiostri",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-juanpablo",
    "full_name": "Juan Pablo Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Juli",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Nacho",
        "type": "under5",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-julian-p",
    "full_name": "Julian Peralta",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-leonardo",
    "full_name": "Leonardo Lopez",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Sofi",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Fran",
        "type": "under12",
        "cost": 20000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-lidia",
    "full_name": "Lidia Carena",
    "allows_companion": true,
    "max_adults": 2,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Alejandro",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Flaviana",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Angelo",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Nadia",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Brunella",
        "type": "over12",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-liliana",
    "full_name": "Liliana Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Sandro Balocco",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Matias Balocco",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Joaquin Balocco",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-lorena-c",
    "full_name": "Lorena Canuto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-lorena",
    "full_name": "Lorena Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Nelson",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Nahuel",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Estefania",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Maria Paz",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-magali",
    "full_name": "Magali Cepero",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-manuel",
    "full_name": "Manuel Sandoval",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-mariana",
    "full_name": "Mariana Chiotta",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-mre",
    "full_name": "Martín Ré",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Meli",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Marti Ré",
        "type": "over12",
        "cost": 30000
      },
      {
        "name": "Benja Ré",
        "type": "over12",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-matias-b",
    "full_name": "Matias Barbeito",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-matias",
    "full_name": "Matias Jannello",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-nicolas-p",
    "full_name": "Nicolas Presti",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Andre",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-noemi",
    "full_name": "Noemi Ogas",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-norma",
    "full_name": "Norma Busca",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Omar Pussetto",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-oscar-a",
    "full_name": "Oscar Alba",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-oscar",
    "full_name": "Oscar Carena",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Ana",
        "type": "adult",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-patricia",
    "full_name": "Patricia Florencia Berkovics",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 0
  },
  {
    "id": "guest-rosario",
    "full_name": "Rosario Sol Belardinelli",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 0
  },
  {
    "id": "guest-sebastian",
    "full_name": "Sebastian Di Gennaro",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-sergio",
    "full_name": "Sergio Pussetto",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Mariana Fassetta",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Martin Pussetto",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Jachu",
        "type": "under5",
        "cost": 0
      },
      {
        "name": "Bautista",
        "type": "under12",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-sol",
    "full_name": "Sol Moreno",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Douglas",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-susana-a",
    "full_name": "Susana Alvarez",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  },
  {
    "id": "guest-tamara",
    "full_name": "Tamara Sosa Vazquez",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Gaston",
        "type": "adult",
        "cost": 100000
      }
    ],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-tonny",
    "full_name": "Tonny Goncalvez",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 0
  },
  {
    "id": "guest-valentin",
    "full_name": "Valentin Medina",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Lara",
        "type": "adult",
        "cost": 30000
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-vanesa",
    "full_name": "Vanesa Perurena",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-vanesa-t",
    "full_name": "Vanesa Tamiozzo",
    "allows_companion": true,
    "max_adults": 1,
    "adult_cost": 100000,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [],
    "phrase_type": "friends",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.851Z",
    "main_cost": 30000
  },
  {
    "id": "guest-victor",
    "full_name": "Victor Fornero",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Sandra Carena",
        "type": "adult",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 0
  },
  {
    "id": "guest-yael",
    "full_name": "Yael Zamparutti",
    "allows_companion": false,
    "max_adults": 0,
    "adult_cost": 0,
    "max_over12": 0,
    "over12_cost": 0,
    "max_under12": 0,
    "under12_cost": 0,
    "locked_companions": [
      {
        "name": "Cristian",
        "type": "adult",
        "cost": 30000
      },
      {
        "name": "Simon",
        "type": "over12",
        "cost": 30000
      },
      {
        "name": "Noa",
        "type": "under5",
        "cost": 0
      }
    ],
    "phrase_type": "family",
    "custom_phrase": "",
    "created_at": "2026-05-13T00:41:07.850Z",
    "main_cost": 30000
  }
];
}

// Migración v3: todos los titulares pagan 30k; acompañantes adultos con cost=0 también.
// Los que ya tenían precio (>0) se mantienen. Niños no cambian.
if ((globalThis.__mockGuestsMigration ?? 0) < 3) {
  globalThis.__mockGuests = globalThis.__mockGuests!.map(g => ({
    ...g,
    main_cost: 30000,
    locked_companions: g.locked_companions.map(lc =>
      lc.type === "adult" && lc.cost === 0 ? { ...lc, cost: 30000 } : lc
    ),
  }));
  globalThis.__mockGuestsMigration = 3;
}

if (!globalThis.__mockConfirmations) {
  globalThis.__mockConfirmations = [];
}

if (!globalThis.__mockPrices) {
  globalThis.__mockPrices = { adult_cost: 100000, over12_cost: 65000, under12_cost: 40000 };
}

if (!globalThis.__mockSettings) {
  globalThis.__mockSettings = {
    cost_deco:       "1400000",
    cost_dj:         "1800000",
    cost_foto_video: "1750000",
    cost_vestido:    "1800000",
  };
}

const guests = globalThis.__mockGuests;
const confirmations = globalThis.__mockConfirmations;

function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const mockDb = {
  guests: {
    list: () => [...guests].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    search: (name: string) => guests.find(g => normalize(g.full_name).includes(normalize(name))) ?? null,
    searchAll: (name: string) => guests.filter(g => normalize(g.full_name).includes(normalize(name))),
    create: (data: Omit<Guest, "id" | "created_at">) => {
      const g: Guest = { ...data, id: uuid(), created_at: new Date().toISOString() };
      guests.push(g);
      return g;
    },
    update: (id: string, data: Partial<Guest>) => {
      const i = guests.findIndex(g => g.id === id);
      if (i === -1) return null;
      guests[i] = { ...guests[i], ...data };
      return guests[i];
    },
    delete: (id: string) => {
      const i = guests.findIndex(g => g.id === id);
      if (i !== -1) guests.splice(i, 1);
    },
  },
  confirmations: {
    list: () => confirmations.map(c => ({
      ...c,
      guests: guests.find(g => g.id === c.guest_id),
    })),
    findByGuestId: (guestId: string) => confirmations.find(c => c.guest_id === guestId) ?? null,
    create: (data: Omit<Confirmation, "id" | "confirmed_at">) => {
      const c: Confirmation = { ...data, paid: false, id: uuid(), confirmed_at: new Date().toISOString() };
      confirmations.push(c);
      return c;
    },
    update: (id: string, data: Partial<Confirmation>) => {
      const i = confirmations.findIndex(c => c.id === id);
      if (i === -1) return null;
      confirmations[i] = { ...confirmations[i], ...data };
      return confirmations[i];
    },
    delete: (id: string) => {
      const i = confirmations.findIndex(c => c.id === id);
      if (i !== -1) confirmations.splice(i, 1);
    },
    metrics: () => ({
      totalGuests: guests.length,
      confirmedGuests: confirmations.length,
      totalCompanions: confirmations.reduce((s, c) => s + c.adult_count + c.over12_count + c.under12_count, 0),
      totalRevenue: confirmations.reduce((s, c) => s + (c.total_cost ?? 0), 0),
    }),
  },
  prices: {
    get: (): Prices => ({ ...globalThis.__mockPrices! }),
    update: (data: Prices) => {
      globalThis.__mockPrices = { ...data };
      return globalThis.__mockPrices;
    },
  },
};
