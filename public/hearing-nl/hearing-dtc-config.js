/**
 * HearFlex DTC checkout — content config
 * Pas teksten, prijzen en afbeeldingen hier aan.
 */
window.HearingDTCConfig = {
  product: {
    name: 'HearFlex™ | Comfortabele hoortoestellen',
    shortDescription:
      'Hoor elk gesprek duidelijk met een discreet en comfortabel ontwerp dat je de hele dag kunt dragen.',
    price: 149,
    originalPrice: 300,
    discountPercent: 50,
    rating: 4.8,
    reviewCount: 3560, // placeholder — vervang met echte data
    shippingLabel: 'Gratis',
  },

  orderBump: {
    enabled: true,
    price: 9.95,
    badge: 'Vaak samen gekozen',
    title: 'Voeg de extra gebruikershandleiding + reserve dompeltips toe',
    description: 'Stap-voor-stap uitleg en extra tips voor optimaal comfort en geluid.',
  },

  productImages: [
    {
      src: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&h=800&fit=crop&q=80',
      alt: 'HearFlex hoortoestel',
    },
    {
      src: 'https://images.unsplash.com/photo-1590658268037-6bf12f032a24?w=800&h=800&fit=crop&q=80',
      alt: 'HearFlex oplaadcase',
    },
    {
      src: 'https://images.unsplash.com/photo-1583394294404-90dc3fbe4f71?w=800&h=800&fit=crop&q=80',
      alt: 'HearFlex in gebruik',
    },
    {
      src: 'https://images.unsplash.com/photo-1559757175-5700bbe6b7aa?w=800&h=800&fit=crop&q=80',
      alt: 'HearFlex detail',
    },
  ],

  trustIcons: [
    { icon: 'trial', label: '90 dagen thuis proberen' },
    { icon: 'warranty', label: '1 jaar garantie' },
    { icon: 'setup', label: 'Binnen 2 minuten ingesteld' },
  ],

  reviews: [
    {
      name: 'Ronald J.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=480&h=360&fit=crop&q=80',
      text: 'Mijn vrouw zegt dat ik eindelijk gestopt ben met schreeuwen naar de televisie. Het volume staat nu veel lager en we kunnen weer normaal samen tv kijken.',
    },
    {
      name: 'Ken M.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=360&fit=crop&q=80',
      text: 'Makkelijk in te stellen en eenvoudig in gebruik. De wereld van geluid komt weer terug en mijn tinnitus lijkt ook minder te worden.',
    },
    {
      name: 'Rodney M.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=360&fit=crop&q=80',
      text: 'Ze zijn bijna onzichtbaar wanneer ik ze draag. Het geluid klinkt helder en natuurlijk, zelfs in drukkere omgevingen.',
    },
    {
      name: 'Edward P.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=480&h=360&fit=crop&q=80',
      text: 'Dit zijn de beste hoortoestellen die ik ooit heb gehad. Vooral tijdens het winkelen merk ik echt verschil.',
    },
  ],

  benefits: [
    {
      icon: 'speed',
      title: 'Snel in gebruik',
      text: 'Binnen enkele minuten ingesteld — geen ingewikkelde stappen of afspraken nodig.',
    },
    {
      icon: 'comfort',
      title: 'Comfortabel ontwerp',
      text: 'Discreet en lichtgewicht, geschikt om de hele dag te dragen zonder irritatie.',
    },
    {
      icon: 'easy',
      title: 'Geen ingewikkelde installatie',
      text: 'Uit de doos, opladen en direct gebruiken. Geen technische kennis vereist.',
    },
    {
      icon: 'support',
      title: 'Nederlandse klantenservice',
      text: 'Vragen? Ons team helpt je snel via e-mail met duidelijke uitleg.',
    },
  ],

  priceComparison: {
    traditional: {
      label: 'Traditionele audicien / winkel',
      price: 2500,
      extras: ['Winkelhuur & personeel', 'Commissie audicien', 'Jaarlijkse batterijen'],
    },
    ours: {
      label: 'HearFlex™ — direct online',
      price: 149,
      highlights: ['Zelfde kerntechnologie', '90 dagen proefperiode', 'Oplaadbaar — geen batterijen'],
    },
  },

  // placeholder stats — vervang met geverifieerde data
  resultStats: [
    { value: 94, label: 'Houdt het toestel na proefperiode' },
    { value: 89, label: 'Merkt duidelijker gesprekken' },
    { value: 92, label: 'Beoordeelt comfort als goed' },
    { value: 87, label: 'Zou aanbevelen aan familie' },
  ],

  howItWorks: [
    { step: 1, title: 'Bestel online', text: 'Vul je gegevens in en rond je bestelling veilig af.' },
    { step: 2, title: 'Opladen & gebruiken', text: 'Laad het toestel op en plaats het comfortabel in je oor.' },
    { step: 3, title: 'Direct resultaat ervaren', text: 'Hoor gesprekken en omgevingsgeluiden weer duidelijker.' },
  ],

  faqItems: [
    {
      q: 'Hoe werkt het product?',
      a: 'HearFlex™ versterkt spraak en dempt achtergrondgeluid via een digitale chip. Je past het volume eenvoudig aan en laadt het toestel op in de meegeleverde case.',
    },
    {
      q: 'Heb ik technische kennis nodig?',
      a: 'Nee. Het toestel is ontworpen om binnen enkele minuten te gebruiken. In de verpakking vind je een duidelijke handleiding met stap-voor-stap uitleg.',
    },
    {
      q: 'Hoe snel wordt het geleverd?',
      a: 'Bestellingen worden doorgaans binnen 2–4 werkdagen verzonden naar adressen in Nederland.',
    },
    {
      q: 'Kan ik het retourneren?',
      a: 'Ja. Je hebt 90 dagen om het product thuis uit te proberen. Niet tevreden? Dan krijg je je geld terug.',
    },
    {
      q: 'Is er garantie?',
      a: 'Ja, je ontvangt 1 jaar garantie op fabricagefouten vanaf de aankoopdatum.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: 'HearFlex™ hoortoestellen, oplaadcase, oplaadkabel, verschillende dompeltips en een gebruikershandleiding.',
    },
    {
      q: 'Hoe neem ik contact op met support?',
      a: 'Stuur een e-mail naar support@hearflex.nl. We reageren doorgaans binnen 1 werkdag.',
    },
  ],

  footer: {
    supportTitle: 'Uitstekende klantenservice',
    email: 'support@hearflex.nl',
    location: 'Nederland',
    links: [
      { label: 'Privacybeleid', href: '#' },
      { label: 'Retourbeleid', href: '#' },
      { label: 'Algemene voorwaarden', href: '#' },
    ],
  },
};
