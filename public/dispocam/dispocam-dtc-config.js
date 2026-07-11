/**
 * DispoCam DTC checkout — content config
 */
const DISPOCAM_IMG = '/dispocam/assets/product';
const DISPOCAM_GALLERY = '/dispocam/assets/gallery';
const DISPOCAM_SOCIAL = '/dispocam/assets/social';
const DISPOCAM_REVIEWS = '/dispocam/assets/reviews';

window.HearingDTCConfig = {
  brand: {
    name: 'DispoCam™',
    logo: null,
    logoAlt: 'DispoCam',
  },

  guaranteeDays: 30,

  deliveryBanner:
    'Alles wat je mist van vroeger, zonder alles wat je haatte.',

  benefitsTitle: 'Waarom DispoCam™',
  howItWorksTitle: 'Van doos tot gebruik',

  product: {
    name: 'DispoCam™ | De wegwerpcamera van vroeger. Zonder het wachten.',
    offerLabel: '1× DispoCam™',
    shortDescription:
      'Schiet zoals in de jaren \'90 — geen scherm, pure nostalgie. Maar je foto\'s staan er direct. Geen filmrolletje, geen ontwikkelkosten, geen weken wachten.',
    price: 69,
    originalPrice: 139,
    discountPercent: 50,
    rating: 4.7,
    reviewCount: 2180,
    shippingLabel: 'Gratis',
  },

  orderBump: {
    enabled: false,
    price: 12.95,
    badge: 'Vaak samen gekozen',
    title: 'Voeg een extra polsband toe',
    description: 'Handig als reserve — zodat je altijd een band paraat hebt.',
  },

  productImages: [
    {
      src: `${DISPOCAM_IMG}/dispocam-front.png`,
      alt: 'DispoCam™ — retro digitale camera, vooraanzicht',
    },
    {
      src: `${DISPOCAM_IMG}/dispocam-contents.png`,
      alt: 'DispoCam™ complete set — camera, doos, USB-kabel en polsband',
    },
    {
      src: `${DISPOCAM_IMG}/dispocam-lifestyle.png`,
      alt: 'DispoCam™ camera in gebruik — vastgehouden in de hand',
    },
  ],

  trustIcons: [
    { icon: 'trial', label: '30 dagen thuis proberen' },
    { icon: 'warranty', label: '1 jaar garantie' },
    { icon: 'setup', label: 'Opgeladen geleverd — klaar om te klikken' },
  ],

  reviewBanner: null,

  filmLookSlider: {
    title: 'De look die je krijgt',
    intro:
      'Geen filter, geen bewerking, geen nabewerken op je telefoon. Elke foto komt uit de DispoCam met die echte jaren-90 film-look — korrel, warme kleuren en datumstempel incluis.',
    footer:
      'Vroeger wachtte je twee weken op deze foto\'s. Nu kijk je ze direct terug.',
    slides: [
      {
        src: `${DISPOCAM_GALLERY}/huisfeest.png`,
        alt: 'Huisfeest met flits — retro filmlook',
        caption: 'Huisfeest, 23:47 — geschoten met flits',
      },
      {
        src: `${DISPOCAM_GALLERY}/zomer.png`,
        alt: 'Sprong van de pier bij zonsondergang',
        caption: 'De zomer die je wil onthouden',
      },
      {
        src: `${DISPOCAM_GALLERY}/festival.png`,
        alt: 'Festival in de crowd',
        caption: 'Festival — midden in de crowd',
      },
      {
        src: `${DISPOCAM_GALLERY}/roadtrip.png`,
        alt: 'Roadtrip ergens onderweg',
        caption: 'Roadtrip, ergens onderweg',
      },
      {
        src: `${DISPOCAM_GALLERY}/terras.png`,
        alt: 'Gouden uur op het terras',
        caption: 'Gouden uur op het terras',
      },
    ],
  },

  socialFeed: {
    title: 'Jouw momenten, bij je mensen',
    body:
      'De mooiste foto\'s zijn de foto\'s die je deelt. Zet je foto\'s in een paar tikken door naar je telefoon en stuur ze naar wie erbij was — of post ze door. Die film-look doet de rest: dit zijn geen perfecte kiekjes, dit zijn échte momenten. En dat ziet iedereen.',
    cta: 'Eén camera op tafel bij een avond met vrienden = de hele avond vastgelegd.',
    image: `${DISPOCAM_SOCIAL}/feed.png`,
    imageAlt: 'DispoCam social feed — retro foto\'s gedeeld met vrienden',
  },

  reviews: [
    {
      name: 'Emma R.',
      avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
      text: 'Precies die old-school vibe, maar mijn foto\'s staan er meteen. Geen rolletje meer naar de winkel.',
    },
    {
      name: 'Tom K.',
      avatar: `${DISPOCAM_REVIEWS}/tomo-avatar.png`,
      text: 'Geen scherm = iedereen is eindelijk weer in het moment. En die film-look is echt leuk.',
    },
    {
      name: 'Lisa M.',
      avatar: `${DISPOCAM_REVIEWS}/lisa-avatar.png`,
      text: 'Op een feestje meegenomen en binnen een uur stonden de foto\'s al op mijn telefoon. Perfect.',
    },
    {
      name: 'Daan V.',
      avatar: `${DISPOCAM_REVIEWS}/daan-avatar.png`,
      text: 'Licht, simpel, één knop. Voelt als een wegwerpcamera — alleen dan eentje die je jaren kunt gebruiken.',
    },
  ],

  benefitsVisual: {
    src: '/dispocam/assets/why-dispocam.png',
    alt: 'Waarom DispoCam — retro film-look, direct terugkijken, 1.000 foto\'s per lading, vol in 30 minuten, deel met je mensen',
  },

  benefits: [],

  priceComparison: {
    traditional: {
      label: 'Wegwerpcamera, elke keer opnieuw',
      price: 40,
      extras: [
        '€25 per camera + €15 ontwikkelen per 27 foto\'s',
        'Weken wachten op je foto\'s',
        'Eenmalig gebruik — daarna weg',
      ],
    },
    ours: {
      label: 'DispoCam™, één keer',
      price: 69,
      highlights: [
        '1.000 foto\'s per lading',
        'Direct terugkijken',
        'Herbruikbaar, jaren mee',
      ],
    },
  },

  resultStats: [],

  howItWorks: [
    {
      step: 1,
      title: 'Bestel online',
      text: 'Vul je gegevens in en rond je bestelling veilig af.',
    },
    {
      step: 2,
      title: 'Uitpakken & klikken',
      text: 'Opgeladen geleverd. Geen instellingen, geen app verplicht — richten en klikken.',
    },
    {
      step: 3,
      title: 'Terugkijken & delen',
      text: 'Bekijk je foto\'s direct en deel ze met vrienden.',
    },
  ],

  faqItems: [
    {
      q: 'Hoeveel foto\'s kan ik maken?',
      a: 'Tot 1.000 foto\'s op één volle lading. Geen filmrolletjes, geen ontwikkelkosten.',
    },
    {
      q: 'Hoe krijg ik mijn foto\'s op mijn telefoon?',
      a: 'Sluit de camera aan via USB-C of gebruik de meegeleverde QR-code om je foto\'s draadloos over te zetten naar je telefoon.',
    },
    {
      q: 'Hoe lang gaat de batterij mee?',
      a: 'Genoeg voor honderden foto\'s per lading. Leeg? Volledig opgeladen in 30 minuten via USB-C.',
    },
    {
      q: 'Heeft hij echt geen scherm?',
      a: 'Klopt — bewust geen scherm. Net als vroeger: richten, klikken, en later terugkijken. Dat hoort bij de ervaring.',
    },
    {
      q: 'Hoe snel wordt het geleverd?',
      a: 'Bestellingen worden doorgaans binnen 2–4 werkdagen verzonden naar adressen in Nederland.',
    },
    {
      q: 'Kan ik het retourneren?',
      a: 'Ja. Je hebt 30 dagen om DispoCam™ thuis uit te proberen. Niet tevreden? Dan krijg je je geld terug.',
    },
    {
      q: 'Is er garantie?',
      a: 'Ja, 1 jaar garantie op fabricagefouten vanaf de aankoopdatum.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: 'DispoCam™ camera, USB-C kabel, polsband, QR-kaart voor overzetten naar je telefoon en een korte handleiding.',
    },
  ],

  footer: {
    supportTitle: 'Uitstekende klantenservice',
    email: 'support@dispocam.nl',
    location: 'Nederland',
    links: [
      { label: 'Algemene voorwaarden', href: '/legal/algemene-voorwaarden.html' },
      { label: 'Privacybeleid', href: '/legal/privacybeleid.html' },
      { label: 'Verzending', href: '/legal/verzending.html' },
      { label: 'Retourbeleid', href: '/legal/retourbeleid.html' },
    ],
  },
};
