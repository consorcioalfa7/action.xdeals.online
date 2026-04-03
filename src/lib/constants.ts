import { type Country, type Currency } from "./types";

export const COUNTRIES: Country[] = [
  { id: "pt", code: "PT", locale: "pt-PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "fr", code: "FR", locale: "fr-FR", name: "France", flag: "🇫🇷", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "es", code: "ES", locale: "es-ES", name: "España", flag: "🇪🇸", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "it", code: "IT", locale: "it-IT", name: "Italia", flag: "🇮🇹", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "nl", code: "NL", locale: "nl-NL", name: "Nederland", flag: "🇳🇱", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "de", code: "DE", locale: "de-DE", name: "Deutschland", flag: "🇩🇪", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "be", code: "BE", locale: "fr-BE", name: "Belgique", flag: "🇧🇪", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "lu", code: "LU", locale: "lb-LU", name: "Luxembourg", flag: "🇱🇺", currency: "EUR", domain: "action.xdeals.online", isActive: true },
  { id: "br", code: "BR", locale: "pt-BR", name: "Brasil", flag: "🇧🇷", currency: "BRL", domain: "action.xdeals.online", isActive: true },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Portugal

export const DELIVERY_CONFIG = {
  freeDeliveryThreshold: 19.9,
  deliveryFee: 4.9,
  estimatedDays: 7,
} as const;

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  BRL: "R$",
};

export const CURRENCY_LOCALES: Record<Currency, string> = {
  EUR: "de-DE",
  BRL: "pt-BR",
};

export const ACTION_COLORS = {
  primary: "#FF6600",
  primaryDark: "#E65C00",
  primaryLight: "#FF8533",
  secondary: "#FFB800",
  accent: "#00B341",
  accentDark: "#008F33",
  danger: "#E4002B",
  dark: "#1A1A1A",
  gray: "#666666",
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
  border: "#E0E0E0",
} as const;

// Action.com category structure
export const CATEGORIES = [
  {
    slug: "alimentacao",
    icon: "ShoppingCart",
    label: { "pt-PT": "Alimentação", "fr-FR": "Alimentation", "es-ES": "Alimentación", "it-IT": "Alimentari", "nl-NL": "Boodschappen", "de-DE": "Lebensmittel", "fr-BE": "Alimentation", "lb-LU": "Liewensmëttel", "pt-BR": "Alimentação" },
    children: [
      { slug: "frutas-legumes", icon: "Apple", label: { "pt-PT": "Frutas & Legumes", "fr-FR": "Fruits & Légumes", "es-ES": "Frutas y Verduras", "it-IT": "Frutta & Verdura", "nl-NL": "Fruit & Groenten", "de-DE": "Obst & Gemüse", "fr-BE": "Fruits & Légumes", "lb-LU": "Uebst & Geméis", "pt-BR": "Frutas & Legumes" } },
      { slug: "lacticinios", icon: "Milk", label: { "pt-PT": "Laticínios", "fr-FR": "Produits Laitiers", "es-ES": "Lácteos", "it-IT": "Latticini", "nl-NL": "Zuivel", "de-DE": "Milchprodukte", "fr-BE": "Produits Laitiers", "lb-LU": "Mëllechprodukter", "pt-BR": "Laticínios" } },
      { slug: "carnes", icon: "Beef", label: { "pt-PT": "Carnes", "fr-FR": "Viandes", "es-ES": "Carnes", "it-IT": "Carni", "nl-NL": "Vlees", "de-DE": "Fleisch", "fr-BE": "Viandes", "lb-LU": "Fleesch", "pt-BR": "Carnes" } },
      { slug: "padaria-pastelaria", icon: "Croissant", label: { "pt-PT": "Padaria & Pastelaria", "fr-FR": "Boulangerie & Pâtisserie", "es-ES": "Panadería & Pastelería", "it-IT": "Panetteria & Pasticceria", "nl-NL": "Bakkerij", "de-DE": "Bäckerei", "fr-BE": "Boulangerie", "lb-LU": "Bäckerei", "pt-BR": "Padaria & Confeitaria" } },
      { slug: "bebidas", icon: "Wine", label: { "pt-PT": "Bebidas", "fr-FR": "Boissons", "es-ES": "Bebidas", "it-IT": "Bevande", "nl-NL": "Dranken", "de-DE": "Getränke", "fr-BE": "Boissons", "lb-LU": "Getränker", "pt-BR": "Bebidas" } },
      { slug: "congelados", icon: "Snowflake", label: { "pt-PT": "Congelados", "fr-FR": "Surgelés", "es-ES": "Congelados", "it-IT": "Surgelati", "nl-NL": "Diepvries", "de-DE": "Tiefkühl", "fr-BE": "Surgelés", "lb-LU": "Gefruer", "pt-BR": "Congelados" } },
      { slug: "mercearia", icon: "Package", label: { "pt-PT": "Mercearia", "fr-FR": "Épicerie", "es-ES": "Abarrotes", "it-IT": "Alimentari", "nl-NL": "Kruidenierswaren", "de-DE": "Lebensmittel", "fr-BE": "Épicerie", "lb-LU": "Liewensmëttel", "pt-BR": "Mercearia" } },
      { slug: "snacks-doces", icon: "Cookie", label: { "pt-PT": "Snacks & Doces", "fr-FR": "Snacks & Bonbons", "es-ES": "Snacks & Dulces", "it-IT": "Snack & Dolci", "nl-NL": "Snacks & Snoep", "de-DE": "Snacks & Süßigkeiten", "fr-BE": "Snacks", "lb-LU": "Snacks", "pt-BR": "Snacks & Doces" } },
    ],
  },
  {
    slug: "casa-decoracao",
    icon: "Home",
    label: { "pt-PT": "Casa & Decoração", "fr-FR": "Maison & Décoration", "es-ES": "Hogar & Decoración", "it-IT": "Casa & Decorazione", "nl-NL": "Huis & Decoratie", "de-DE": "Haushalt & Deko", "fr-BE": "Maison & Décoration", "lb-LU": "Haus & Dekoratioun", "pt-BR": "Casa & Decoração" },
    children: [
      { slug: "textil-casa", icon: "BedDouble", label: { "pt-PT": "Têxtil de Casa", "fr-FR": "Textile Maison", "es-ES": "Textil Hogar", "it-IT": "Tessili Casa", "nl-NL": "HuisTextiel", "de-DE": "Haushaltstextilien", "fr-BE": "Textile Maison", "lb-LU": "Heemtextilien", "pt-BR": "Têxtil para Casa" } },
      { slug: "louca-talheres", icon: "UtensilsCrossed", label: { "pt-PT": "Louça & Talheres", "fr-FR": "Vaisselle & Couverts", "es-ES": "Vajilla & Cubiertos", "it-IT": "Stoviglie & Posate", "nl-NL": "Servies & Bestek", "de-DE": "Geschirr & Besteck", "fr-BE": "Vaisselle", "lb-LU": "Déisch", "pt-BR": "Louça & Talheres" } },
      { slug: "iluminacao", icon: "Lamp", label: { "pt-PT": "Iluminação", "fr-FR": "Éclairage", "es-ES": "Iluminación", "it-IT": "Illuminazione", "nl-NL": "Verlichting", "de-DE": "Beleuchtung", "fr-BE": "Éclairage", "lb-LU": "Beliichtung", "pt-BR": "Iluminação" } },
      { slug: "decoracao", icon: "Paintbrush", label: { "pt-PT": "Decoração", "fr-FR": "Décoration", "es-ES": "Decoración", "it-IT": "Decorazione", "nl-NL": "Decoratie", "de-DE": "Deko", "fr-BE": "Décoration", "lb-LU": "Dekoratioun", "pt-BR": "Decoração" } },
      { slug: "organizacao", icon: "Archive", label: { "pt-PT": "Organização", "fr-FR": "Rangement", "es-ES": "Organización", "it-IT": "Organizzazione", "nl-NL": "Opbergen", "de-DE": "Aufbewahrung", "fr-BE": "Rangement", "lb-LU": "Opbaueren", "pt-BR": "Organização" } },
    ],
  },
  {
    slug: "bricolage-ferramentas",
    icon: "Wrench",
    label: { "pt-PT": "Bricolage & Ferramentas", "fr-FR": "Bricolage & Outils", "es-ES": "Bricolaje & Herramientas", "it-IT": "Fai da Te & Utensili", "nl-NL": "Klus & Gereedschap", "de-DE": "Werkzeug & Heimwerker", "fr-BE": "Bricolage", "lb-LU": "Handwierk", "pt-BR": "Ferramentas & Bricolage" },
    children: [
      { slug: "ferramentas-manuais", icon: "Hammer", label: { "pt-PT": "Ferramentas Manuais", "fr-FR": "Outils Manuels", "es-ES": "Herramientas Manuales", "it-IT": "Utensili Manuali", "nl-NL": "Handgereedschap", "de-DE": "Handwerkszeuge", "fr-BE": "Outils", "lb-LU": "Handwierksgeschir", "pt-BR": "Ferramentas Manuais" } },
      { slug: "ferramentas-eletricas", icon: "Zap", label: { "pt-PT": "Ferramentas Elétricas", "fr-FR": "Outils Électriques", "es-ES": "Herramientas Eléctricas", "it-IT": "Utensili Elettrici", "nl-NL": "Elektrisch Gereedschap", "de-DE": "Elektrowerkzeuge", "fr-BE": "Outils Électriques", "lb-LU": "Elektresch Geschir", "pt-BR": "Ferramentas Elétricas" } },
      { slug: "pintura", icon: "PaintBucket", label: { "pt-PT": "Pintura", "fr-FR": "Peinture", "es-ES": "Pintura", "it-IT": "Pittura", "nl-NL": "Verf", "de-DE": "Farbe", "fr-BE": "Peinture", "lb-LU": "Faarf", "pt-BR": "Tintas" } },
      { slug: "fixacao", icon: "Link", label: { "pt-PT": "Fixação", "fr-FR": "Fixation", "es-ES": "Fijación", "it-IT": "Fissaggio", "nl-NL": "Bevestiging", "de-DE": "Befestigung", "fr-BE": "Fixation", "lb-LU": "Befestegung", "pt-BR": "Fixação" } },
    ],
  },
  {
    slug: "jardim",
    icon: "Flower2",
    label: { "pt-PT": "Jardim", "fr-FR": "Jardin", "es-ES": "Jardín", "it-IT": "Giardino", "nl-NL": "Tuin", "de-DE": "Garten", "fr-BE": "Jardin", "lb-LU": "Gaart", "pt-BR": "Jardim" },
    children: [
      { slug: "plantas", icon: "Sprout", label: { "pt-PT": "Plantas", "fr-FR": "Plantes", "es-ES": "Plantas", "it-IT": "Piante", "nl-NL": "Planten", "de-DE": "Pflanzen", "fr-BE": "Plantes", "lb-LU": "Planzen", "pt-BR": "Plantas" } },
      { slug: "ferramentas-jardim", icon: "Shovel", label: { "pt-PT": "Ferramentas de Jardim", "fr-FR": "Outils de Jardin", "es-ES": "Herramientas de Jardín", "it-IT": "Utensili da Giardino", "nl-NL": "Tuin gereedschap", "de-DE": "Gartengeräte", "fr-BE": "Outils Jardin", "lb-LU": "Gaartgeschir", "pt-BR": "Ferramentas de Jardim" } },
      { slug: "mobiliario-jardim", icon: "Armchair", label: { "pt-PT": "Mobiliário de Jardim", "fr-FR": "Mobilier de Jardin", "es-ES": "Mobiliario de Jardín", "it-IT": "Arredo Giardino", "nl-NL": "Tuinmeubels", "de-DE": "Gartenmöbel", "fr-BE": "Mobilier Jardin", "lb-LU": "Gaartmiwwelen", "pt-BR": "Móveis de Jardim" } },
    ],
  },
  {
    slug: "animais",
    icon: "PawPrint",
    label: { "pt-PT": "Animais", "fr-FR": "Animaux", "es-ES": "Animales", "it-IT": "Animali", "nl-NL": "Dieren", "de-DE": "Tiere", "fr-BE": "Animaux", "lb-LU": "Déieren", "pt-BR": "Animais" },
    children: [
      { slug: "alimentacao-animais", icon: "Dog", label: { "pt-PT": "Alimentação Animal", "fr-FR": "Alimentation Animale", "es-ES": "Alimentación Animal", "it-IT": "Alimentazione Animali", "nl-NL": "Dierenvoer", "de-DE": "Tierfutter", "fr-BE": "Alimentation", "lb-LU": "Déierennahrung", "pt-BR": "Alimentação Animal" } },
      { slug: "acessorios-animais", icon: "Bone", label: { "pt-PT": "Acessórios para Animais", "fr-FR": "Accessoires Animaux", "es-ES": "Accesorios Animales", "it-IT": "Accessori Animali", "nl-NL": "Dierenaccessoires", "de-DE": "Tierzubehör", "fr-BE": "Accessoires", "lb-LU": "Déierenzubehör", "pt-BR": "Acessórios para Animais" } },
    ],
  },
  {
    slug: "higiene-beleza",
    icon: "Sparkles",
    label: { "pt-PT": "Higiene & Beleza", "fr-FR": "Hygiène & Beauté", "es-ES": "Higiene & Belleza", "it-IT": "Igiene & Bellezza", "nl-NL": "Verzorging", "de-DE": "Pflege & Schönheit", "fr-BE": "Hygiène", "lb-LU": "Hygiène & Schéinheet", "pt-BR": "Higiene & Beleza" },
    children: [
      { slug: "cuidados-pessoais", icon: "Droplets", label: { "pt-PT": "Cuidados Pessoais", "fr-FR": "Soins Personnels", "es-ES": "Cuidados Personales", "it-IT": "Cura Persona", "nl-NL": "Persoonlijke Verzorging", "de-DE": "Körperpflege", "fr-BE": "Soins", "lb-LU": "Perséinlech Pflucht", "pt-BR": "Cuidados Pessoais" } },
      { slug: "limpeza-casa", icon: "SprayCan", label: { "pt-PT": "Limpeza da Casa", "fr-FR": "Entretien Maison", "es-ES": "Limpieza del Hogar", "it-IT": "Pulizia Casa", "nl-NL": "Huishoudelijk", "de-DE": "Haushalt", "fr-BE": "Entretien", "lb-LU": "Botz", "pt-BR": "Limpeza da Casa" } },
      { slug: "perfumaria", icon: "FlaskConical", label: { "pt-PT": "Perfumaria", "fr-FR": "Parfumerie", "es-ES": "Perfumería", "it-IT": "Profumeria", "nl-NL": "Parfumerie", "de-DE": "Parfümerie", "fr-BE": "Parfumerie", "lb-LU": "Parfumerie", "pt-BR": "Perfumaria" } },
    ],
  },
  {
    slug: "brinquedos-lazer",
    icon: "Gamepad2",
    label: { "pt-PT": "Brinquedos & Lazer", "fr-FR": "Jouets & Loisirs", "es-ES": "Juguetes & Ocio", "it-IT": "Giocattoli & Tempo Libero", "nl-NL": "Speelgoed", "de-DE": "Spielzeug & Freizeit", "fr-BE": "Jouets", "lb-LU": "Spillsch", "pt-BR": "Brinquedos & Lazer" },
    children: [
      { slug: "brinquedos-criancas", icon: "Baby", label: { "pt-PT": "Brinquedos para Crianças", "fr-FR": "Jouets Enfants", "es-ES": "Juguetes para Niños", "it-IT": "Giocattoli Bambini", "nl-NL": "Kinderspeelgoed", "de-DE": "Kinderspielzeug", "fr-BE": "Jouets Enfants", "lb-LU": "Kannerspillsch", "pt-BR": "Brinquedos Infantis" } },
      { slug: "passeio", icon: "Bike", label: { "pt-PT": "Passeio & Desporto", "fr-FR": "Promenade & Sport", "es-ES": "Paseo & Deporte", "it-IT": "Passeggio & Sport", "nl-NL": "Sport", "de-DE": "Sport & Freizeit", "fr-BE": "Sport", "lb-LU": "Sport", "pt-BR": "Passeio & Esporte" } },
      { slug: "jogos-puzzles", icon: "Puzzle", label: { "pt-PT": "Jogos & Puzzles", "fr-FR": "Jeux & Puzzles", "es-ES": "Juegos & Puzzles", "it-IT": "Giochi & Puzzle", "nl-NL": "Spellen & Puzzels", "de-DE": "Spiele & Puzzles", "fr-BE": "Jeux", "lb-LU": "Spiller", "pt-BR": "Jogos & Quebra-cabeças" } },
    ],
  },
  {
    slug: "roupa-acessorios",
    icon: "Shirt",
    label: { "pt-PT": "Roupa & Acessórios", "fr-FR": "Vêtements & Accessoires", "es-ES": "Ropa & Accesorios", "it-IT": "Abbigliamento & Accessori", "nl-NL": "Kleding", "de-DE": "Bekleidung", "fr-BE": "Vêtements", "lb-LU": "Kleidung", "pt-BR": "Roupas & Acessórios" },
    children: [
      { slug: "roupa-homem", icon: "User", label: { "pt-PT": "Roupa Homem", "fr-FR": "Vêtements Homme", "es-ES": "Ropa Hombre", "it-IT": "Abbigliamento Uomo", "nl-NL": "Herenkleding", "de-DE": "Herrenkleidung", "fr-BE": "Homme", "lb-LU": "Männer", "pt-BR": "Roupa Masculina" } },
      { slug: "roupa-mulher", icon: "UserRound", label: { "pt-PT": "Roupa Mulher", "fr-FR": "Vêtements Femme", "es-ES": "Ropa Mujer", "it-IT": "Abbigliamento Donna", "nl-NL": "Dameskleding", "de-DE": "Damenkleidung", "fr-BE": "Femme", "lb-LU": "Frauen", "pt-BR": "Roupa Feminina" } },
      { slug: "calcado", icon: "Footprints", label: { "pt-PT": "Calçado", "fr-FR": "Chaussures", "es-ES": "Calzado", "it-IT": "Calzature", "nl-NL": "Schoenen", "de-DE": "Schuhe", "fr-BE": "Chaussures", "lb-LU": "Schong", "pt-BR": "Calçados" } },
    ],
  },
  {
    slug: "papelaria-escritorio",
    icon: "PenTool",
    label: { "pt-PT": "Papelaria & Escritório", "fr-FR": "Papeterie & Bureau", "es-ES": "Papelería & Oficina", "it-IT": "Cancelleria & Ufficio", "nl-NL": "Kantoor", "de-DE": "Bürobedarf", "fr-BE": "Papeterie", "lb-LU": "Büro", "pt-BR": "Papelaria & Escritório" },
    children: [
      { slug: "material-escolar", icon: "GraduationCap", label: { "pt-PT": "Material Escolar", "fr-FR": "Fournitures Scolaires", "es-ES": "Material Escolar", "it-IT": "Materiale Scolastico", "nl-NL": "Schoolspullen", "de-DE": "Schulbedarf", "fr-BE": "Fournitures", "lb-LU": "Schoulmaterial", "pt-BR": "Material Escolar" } },
      { slug: "escritorio", icon: "Monitor", label: { "pt-PT": "Escritório", "fr-FR": "Bureau", "es-ES": "Oficina", "it-IT": "Ufficio", "nl-NL": "Kantoor", "de-DE": "Büro", "fr-BE": "Bureau", "lb-LU": "Büro", "pt-BR": "Escritório" } },
    ],
  },
];

// Footer links
export const FOOTER_LINKS = {
  sobre: {
    "pt-PT": ["Sobre a Action", "Carreiras", "Sustentabilidade", "Notícias", "Imprensa"],
    "fr-FR": ["À propos d'Action", "Carrières", "Développement durable", "Actualités", "Presse"],
    "es-ES": ["Sobre Action", "Carreras", "Sostenibilidad", "Noticias", "Prensa"],
    "it-IT": ["Chi è Action", "Carriere", "Sostenibilità", "Notizie", "Stampa"],
    "nl-NL": ["Over Action", "Vacatures", "Duurzaamheid", "Nieuws", "Pers"],
    "de-DE": ["Über Action", "Karriere", "Nachhaltigkeit", "Neuigkeiten", "Presse"],
    "fr-BE": ["À propos", "Carrières", "Développement durable", "Actualités", "Presse"],
    "lb-LU": ["Iwwer Action", "Carrières", "Nohaltegkeet", "Neiegkeeten", "Press"],
    "pt-BR": ["Sobre a Action", "Carreiras", "Sustentabilidade", "Notícias", "Imprensa"],
  },
  ajuda: {
    "pt-PT": ["Perguntas Frequentes", "Contacto", "Entregas", "Devoluções", "Política de Privacidade"],
    "fr-FR": ["Questions fréquentes", "Contact", "Livraisons", "Retours", "Politique de confidentialité"],
    "es-ES": ["Preguntas frecuentes", "Contacto", "Envíos", "Devoluciones", "Política de privacidad"],
    "it-IT": ["Domande frequenti", "Contatti", "Spedizioni", "Resi", "Informativa sulla privacy"],
    "nl-NL": ["Veelgestelde vragen", "Contact", "Levering", "Retouren", "Privacybeleid"],
    "de-DE": ["Häufige Fragen", "Kontakt", "Lieferung", "Rückgabe", "Datenschutz"],
    "fr-BE": ["FAQ", "Contact", "Livraisons", "Retours", "Vie privée"],
    "lb-LU": ["FAQ", "Kontakt", "Liwwerungen", "Réckgab", "Dateschutz"],
    "pt-BR": ["Perguntas Frequentes", "Contato", "Entregas", "Devoluções", "Política de Privacidade"],
  },
  servicos: {
    "pt-PT": ["Cartão Fidelidade", "Newsletter", "Aplicação Móvel", "Cartão Oferta", "Poupanças Semanais"],
    "fr-FR": ["Carte de fidélité", "Newsletter", "Application mobile", "Carte cadeau", "Offres hebdomadaires"],
    "es-ES": ["Tarjeta de fidelidad", "Boletín", "App móvil", "Tarjeta regalo", "Ofertas semanales"],
    "it-IT": ["Carta fedeltà", "Newsletter", "App mobile", "Carta regalo", "Offerte settimanali"],
    "nl-NL": ["Bonuskaart", "Nieuwsbrief", "App", "Cadeaubon", "Weekaanbiedingen"],
    "de-DE": ["Bonuskarte", "Newsletter", "App", "Geschenkkarte", "Wochenangebote"],
    "fr-BE": ["Carte fidélité", "Newsletter", "App mobile", "Carte cadeau", "Offres"],
    "lb-LU": ["Treuekaart", "Newsletter", "App", "Geschenkkaart", "Wuchenangeboter"],
    "pt-BR": ["Cartão Fidelidade", "Newsletter", "App", "Cartão Presente", "Ofertas Semanais"],
  },
};
