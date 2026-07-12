/**
 * DispoCam DTC checkout — content config
 */
const DISPOCAM_IMG = '/dispocam/assets/product';
const DISPOCAM_GALLERY = '/dispocam/assets/gallery';
const DISPOCAM_SOCIAL = '/dispocam/assets/social';
const DISPOCAM_REVIEWS = '/dispocam/assets/reviews';

window.HearingDTCConfig = {
  brand: {
    name: 'DispoCam',
    logo: null,
    logoAlt: 'DispoCam',
  },

  brandPage: {
    topBar: 'Gratis verzending in NL & BE · Eerste batch nu leverbaar',
    mobileCta: {
      label: 'Dispocam',
      button: 'Bestel nu',
    },
    tagline: 'Eén camera, tien jaar herinneringen.',
    manifest:
      'De mooiste foto\'s zijn niet perfect. Ze zijn korrelig, geflitst, half scheef, en precies zoals die avond voelde. Daarom bestaat Dispocam: de camera die schiet zoals vroeger, maar denkt zoals nu. Geen scherm dat je avond steelt. Geen rolletje wegbrengen. Geen camera die je na 27 foto\'s weggooit. Klik, leef verder. Je foto\'s staan er al.',
    founderNote: {
      text:
        'Dispocam begon met een simpele irritatie: €40 kwijt aan een wegwerpcamera, drie weken wachten op je foto\'s, en daarna gooi je het ding weg. Dat moest anders kunnen: dezelfde vibe, zonder het gedoe.',
      author: 'Jona, oprichter',
    },
    visionTeaser: {
      title: 'Dit is pas het begin.',
      body:
        'We bouwen aan een plek waar alleen échte foto\'s bestaan. Geen filters, geen AI, alleen momenten geschoten met een Dispocam. Koop je nu een camera, dan ben je er straks als eerste bij.',
    },
    mainCta: {
      title: 'Bestel je Dispocam',
      sub: 'Gratis verzending · 30 dagen thuis proberen',
    },
    shippingPromise: 'Gratis verzending in NL & BE',
  },

  guaranteeDays: 30,

  deliveryBanner:
    'Alles wat je mist van vroeger, zonder alles wat je haatte.',

  benefitsTitle: 'De DispoCam',
  howItWorksTitle: 'Van doos tot gebruik',

  sectionOrder: [
    'filmLook',
    'benefits',
    'manifest',
    'reviews',
    'priceComparison',
    'howItWorks',
    'guarantee',
    'founderNote',
    'faq',
    'visionTeaser',
    'brandTagline',
  ],

  product: {
    name: 'DispoCam | De wegwerpcamera van vroeger. Zonder het wachten.',
    offerLabel: '1× DispoCam',
    shortDescription:
      'Schiet zoals in de jaren \'90 — geen scherm, pure nostalgie. Maar je foto\'s staan er direct op je Dispocam. Geen filmrolletje, geen ontwikkelkosten, geen weken wachten.',
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
      alt: 'DispoCam — retro digitale camera, vooraanzicht',
    },
    {
      src: `${DISPOCAM_IMG}/dispocam-contents.png`,
      alt: 'DispoCam complete set — camera, doos, USB-kabel, polsband en QR-kaart',
    },
    {
      src: `${DISPOCAM_IMG}/dispocam-benefits.png`,
      alt: 'DispoCam — camera met voordelen: direct op je telefoon, 1.000 foto\'s, film-look en 60 dagen garantie',
    },
    {
      src: `${DISPOCAM_IMG}/dispocam-setup.png`,
      alt: 'DispoCam koppelen in 1 minuut — QR scannen en direct gekoppeld op je telefoon',
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
    cta: 'Eén Dispocam op tafel bij een avond met vrienden = de hele avond vastgelegd.',
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

  benefitsList: [
    'Foto gemaakt? Real-time beschikbaar op je telefoon, zonder kabel of gedoe',
    '1.000 foto\'s met 1 accu, daarna in 30 minuten weer 100% opgeladen',
    'Deel je foto\'s direct met iedereen die erbij was',
    'Geen scherm, geen afleiding: schiet zoals in de jaren \'90 en kijk terug op je telefoon',
    'Echte film-look op elke foto, zonder filters of bewerking',
    'In 1 minuut gekoppeld: uitpakken, QR scannen, klaar',
    'Eén Dispocam, 10 jaar plezier. Geen rolletjes of ontwikkelkosten',
    '60 dagen niet-goed-geld-terug en 1 jaar garantie',
  ],

  benefits: [],

  comparisonTable: {
    title: 'Waarom de DispoCam?',
    left: {
      label: 'Normale disposable camera',
      items: [
        'Weken wachten op ontwikkelen',
        '27 foto\'s per rolletje',
        '€15 ontwikkelkosten, elke keer',
        'Delen? Eerst laten scannen',
        'Eenmalig gebruik — daarna afval',
        'Geen garantie',
      ],
    },
    right: {
      label: 'DispoCam',
      items: [
        'Direct op je telefoon',
        '1.000 foto\'s per lading',
        'In 30 minuten opgeladen',
        'Deel direct met vrienden en familie',
        'In 1 minuut ingesteld, 10 jaar bruikbaar',
        '60 dagen niet-goed-geld-terug',
      ],
    },
  },

  priceComparison: null,

  resultStats: [],

  howItWorks: [],

  howItWorksVisual: {
    title: 'Hoe werkt het',
    intro:
      'Geen handleiding van 40 pagina\'s. Drie stappen en je bent klaar om te schieten — net als vroeger, alleen dan digitaal.',
    image: '/dispocam/assets/how-it-works.png',
    imageAlt: 'DispoCam setup in drie stappen — uitpakken, scannen, klaar',
    tagline: 'Stel in 1 minuut in, gebruik 10 jaar',
    steps: [
      {
        step: 1,
        title: 'Uitpakken',
        text: 'Je DispoCam, kabel en QR-kaart — alles zit in de doos. Opgeladen en klaar om te gebruiken.',
      },
      {
        step: 2,
        title: 'Scannen',
        text: 'Scan de QR-code met je telefoon. Binnen seconden gekoppeld — geen account, geen gedoe.',
      },
      {
        step: 3,
        title: 'Klaar',
        text: 'Maak foto\'s, bekijk ze direct op je telefoon en deel ze met wie erbij was.',
      },
    ],
  },

  faqItems: [
    {
      q: 'Hoeveel foto\'s kan ik maken?',
      a: 'Tot 1.000 foto\'s op één volle lading. Geen filmrolletjes, geen ontwikkelkosten.',
    },
    {
      q: 'Hoe krijg ik mijn foto\'s op mijn telefoon?',
      a: 'Sluit je Dispocam aan via USB-C of gebruik de meegeleverde QR-code om je foto\'s draadloos over te zetten naar je telefoon.',
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
      a: 'Ja. Je hebt 30 dagen om je Dispocam thuis uit te proberen. Niet tevreden? Dan krijg je je geld terug.',
    },
    {
      q: 'Is er garantie?',
      a: 'Ja, 1 jaar garantie op fabricagefouten vanaf de aankoopdatum.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: 'Je DispoCam, USB-C kabel, polsband, QR-kaart voor overzetten naar je telefoon en een korte handleiding.',
    },
  ],

  site: {
    announcement: 'Gratis verzending in NL & BE · Eerste batch nu leverbaar',
    nav: {
      shop: 'Shop',
      mission: { label: 'Onze missie', href: '/dispocam/missie.html' },
      faq: { label: 'FAQ', href: '/dispocam/checkout.html#faq' },
      feed: { label: 'Feed', href: '/dispocam/feed.html' },
      support: { label: 'Support', href: 'mailto:hallo@dispocam.nl' },
    },
    megaMenu: {
      product: {
        title: 'Dispocam 1.0',
        image: `${DISPOCAM_IMG}/dispocam-front.png`,
        href: '/dispocam/checkout.html',
      },
    },
    mission: {
      hint: 'Swipe naar rechts voor de volgende pagina',
      slides: [
        {
          type: 'cover',
          label: 'Onze missie',
          title: 'Hoe Dispocam ontstond',
          meta: { date: 'Juli 2025', readTime: '8 min lezen', author: 'Jona, oprichter' },
        },
        {
          paragraphs: [
            'Het begon op een verjaardag, ergens vorig jaar. De vriendin van mijn broer liet foto\'s zien van een weekendje weg, en tussendoor zei ze iets dat ik pas veel later echt hoorde: "Nee, de foto\'s van de wegwerpcamera zien we pas over een paar dagen. En het kost ook nog eens geld om ze te laten ontwikkelen."',
            'Het vloog voorbij, zoals dat gaat. Iedereen knikte, iemand pakte de taart, klaar.',
          ],
        },
        {
          paragraphs: [
            'Maar het bleef ergens hangen. Weken later begon ik er over mijn eigen vriendin over. Ik vroeg haar of ze die camera\'s kende, en natuurlijk kende ze die. Zij en haar vriendinnen namen er eentje mee naar elk festival. En haar verhaal was letterlijk hetzelfde: veertig euro kwijt, weken wachten, de helft van de foto\'s mislukt, en daarna gooi je het ding weg. "Maar die foto\'s zijn wel de leukste die we hebben," zei ze erbij.',
            'Dat is toch gek? Het beste fotoproduct dat ik kende was ook meteen het onhandigste.',
          ],
        },
        {
          paragraphs: [
            'Wat ze niet wist: ik had stiekem al een site gebouwd. Ik speelde de nieuwsgierige vriend, stelde nog wat vragen, en liet haar vijf minuten later mijn scherm zien. Ik wilde haar echte mening, niet de lieve versie. Ze keek er even naar, scrolde, en zei: "Oké. Dit zou ik kopen."',
          ],
          highlight: 'Toen wist ik het.',
        },
        {
          paragraphs: [
            'Nu moet ik iets bekennen: ik ben een man van 21 die een product lanceert dat vooral vrouwen gaan gebruiken. Dat is ongeveer zo logisch als een visboer die parfum gaat verkopen. Dus heb ik het enige verstandige gedaan dat een man in mijn positie kan doen: heel veel vragen stellen en vooral heel goed luisteren. Naar mijn vriendin, haar vriendinnen, de vriendin van mijn broer. Elke keuze in dit product, van de film-look tot het formaat van het polsbandje, is langs hen gegaan voordat \'ie langs mij mocht.',
          ],
        },
        {
          paragraphs: [
            'Daarna zijn we gaan bouwen. Prototypes getest, software ontwikkeld, net zo lang tot het klopte: een camera met de vibe van 1980 en de technologie van vandaag. Geen scherm, geen filters, gewoon richten en klikken zoals vroeger. Maar je foto\'s staan direct op je telefoon, ontwikkelen kost niks meer, en je gooit \'m nooit meer weg.',
            'Zo is de Dispocam ontstaan. Een oud product in een nieuw jasje, gemaakt door iemand die er vol voor gaat en geen plan B heeft.',
          ],
        },
        {
          paragraphs: [
            'Maar de camera is pas het begin. We bouwen aan een platform waar alleen foto\'s staan die met een Dispocam zijn gemaakt — pure momenten, pure foto\'s. Geen filters, geen AI, geen perfecte kiekjes die er eigenlijk anders uitzagen. Alleen wat er écht was, geschoten met één knop en die korrelige film-look die je nergens anders krijgt. Dat is waar we naartoe werken.',
            'De foto\'s zijn nog steeds korrelig, geflitst en half scheef. Dat houden we zo. De rest hebben we sneller, slimmer en vooral heel veel vetter gemaakt.',
          ],
        },
        {
          type: 'byline',
          text: 'Jona, oprichter van Dispocam',
        },
      ],
    },
    hero: {
      image: `${DISPOCAM_GALLERY}/huisfeest.png`,
      title: 'De wegwerpcamera van vroeger.',
      subtitle: 'Zonder het wachten.',
      body: 'Schiet zoals in de jaren \'90 — geen scherm, pure nostalgie. Je foto\'s staan er direct.',
      cta: 'Shop Dispocam',
      ctaHref: '/dispocam/checkout.html',
      rating: '4,7/5 · 2.180+ beoordelingen',
    },
    products: {
      title: 'Bestsellers',
      shopAllHref: '/dispocam/checkout.html',
      items: [
        {
          name: 'Dispocam',
          variant: 'Classic Black',
          price: 69,
          image: `${DISPOCAM_IMG}/dispocam-front.png`,
          href: '/dispocam/checkout.html',
          badge: 'Bestseller',
        },
      ],
    },
    moments: {
      title: 'Meer Dispocam-momenten',
      items: [
        { image: `${DISPOCAM_GALLERY}/festival.png`, title: 'Festival', href: '/dispocam/checkout.html#film-look' },
        { image: `${DISPOCAM_GALLERY}/roadtrip.png`, title: 'Roadtrip', href: '/dispocam/checkout.html#film-look' },
        { image: `${DISPOCAM_GALLERY}/terras.png`, title: 'Terras', href: '/dispocam/checkout.html#film-look' },
      ],
    },
    feed: {
      title: 'Feed',
      subtitle: 'Echte momenten. Geschoten met een Dispocam.',
      posts: [
        {
          id: 'f1',
          image: `${DISPOCAM_GALLERY}/huisfeest.png`,
          alt: 'Huisfeest met flits',
          caption: 'Huisfeest, 23:47 — geschoten met flits',
          rotate: -2.8,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. Dispocam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f2',
          image: `${DISPOCAM_GALLERY}/zomer.png`,
          alt: 'Sprong van de pier',
          caption: 'De zomer die je wil onthouden',
          rotate: 1.6,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${DISPOCAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
        {
          id: 'f3',
          image: `${DISPOCAM_REVIEWS}/emma-photo.png`,
          alt: 'Retro foto Emma',
          caption: 'Oude vibe, nieuwe foto\'s',
          rotate: -1.2,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. Dispocam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f4',
          image: `${DISPOCAM_GALLERY}/festival.png`,
          alt: 'Festival in de crowd',
          caption: 'Festival — midden in de crowd',
          rotate: 2.4,
          author: {
            name: 'Tom K.',
            handle: 'tomk',
            avatar: `${DISPOCAM_REVIEWS}/tomo-avatar.png`,
            bio: 'Geen scherm, geen afleiding — alleen het moment en de muziek.',
            location: 'Utrecht',
          },
        },
        {
          id: 'f5',
          image: `${DISPOCAM_GALLERY}/roadtrip.png`,
          alt: 'Roadtrip onderweg',
          caption: 'Roadtrip, ergens onderweg',
          rotate: -3.1,
          author: {
            name: 'Daan V.',
            handle: 'daanv',
            avatar: `${DISPOCAM_REVIEWS}/daan-avatar.png`,
            bio: 'Onderweg schieten, thuis terugkijken. Eén knop, geen gedoe.',
            location: 'Den Haag',
          },
        },
        {
          id: 'f6',
          image: `${DISPOCAM_REVIEWS}/lisa-photo.png`,
          alt: 'Retro foto Lisa',
          caption: 'Gisteren avond, vandaag op m\'n telefoon',
          rotate: 1.8,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${DISPOCAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
        {
          id: 'f7',
          image: `${DISPOCAM_GALLERY}/terras.png`,
          alt: 'Gouden uur op het terras',
          caption: 'Gouden uur op het terras',
          rotate: -1.9,
          author: {
            name: 'Noah B.',
            handle: 'noah_b',
            avatar: `${DISPOCAM_REVIEWS}/daan-avatar.png`,
            bio: 'Terras, wijn, en foto\'s die eruitzien alsof ze uit 1998 komen.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f8',
          image: `${DISPOCAM_GALLERY}/huisfeest.png`,
          alt: 'Flits op het dancefloor',
          caption: '23:47 — niemand wist dat dit eruit zou zien',
          rotate: 2.1,
          author: {
            name: 'Tom K.',
            handle: 'tomk',
            avatar: `${DISPOCAM_REVIEWS}/tomo-avatar.png`,
            bio: 'Geen scherm, geen afleiding — alleen het moment en de muziek.',
            location: 'Utrecht',
          },
        },
        {
          id: 'f9',
          image: `${DISPOCAM_REVIEWS}/daan-photo.png`,
          alt: 'Retro foto Daan',
          caption: 'Klik, leef verder',
          rotate: -2.2,
          author: {
            name: 'Daan V.',
            handle: 'daanv',
            avatar: `${DISPOCAM_REVIEWS}/daan-avatar.png`,
            bio: 'Onderweg schieten, thuis terugkijken. Eén knop, geen gedoe.',
            location: 'Den Haag',
          },
        },
        {
          id: 'f10',
          image: `${DISPOCAM_GALLERY}/zomer.png`,
          alt: 'Zomer aan het water',
          caption: 'Sprong. Klik. Klaar.',
          rotate: 3,
          author: {
            name: 'Sofie L.',
            handle: 'sofie_l',
            avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
            bio: 'Alles wat ik wil onthouden, schiet ik met m\'n Dispocam.',
            location: 'Groningen',
          },
        },
        {
          id: 'f11',
          image: `${DISPOCAM_GALLERY}/festival.png`,
          alt: 'Crowd shot festival',
          caption: 'Main stage, 01:12',
          rotate: -1.5,
          author: {
            name: 'Noah B.',
            handle: 'noah_b',
            avatar: `${DISPOCAM_REVIEWS}/daan-avatar.png`,
            bio: 'Terras, wijn, en foto\'s die eruitzien alsof ze uit 1998 komen.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f12',
          image: `${DISPOCAM_GALLERY}/roadtrip.png`,
          alt: 'Underweg met vrienden',
          caption: 'Ergens tussen Utrecht en nergens',
          rotate: 1.3,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. Dispocam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f13',
          image: `${DISPOCAM_GALLERY}/terras.png`,
          alt: 'Avond op het terras',
          caption: 'Vrijdagavond, geen filter nodig',
          rotate: -2.6,
          author: {
            name: 'Sofie L.',
            handle: 'sofie_l',
            avatar: `${DISPOCAM_REVIEWS}/emma-avatar.png`,
            bio: 'Alles wat ik wil onthouden, schiet ik met m\'n Dispocam.',
            location: 'Groningen',
          },
        },
        {
          id: 'f14',
          image: `${DISPOCAM_REVIEWS}/lisa-photo.png`,
          alt: 'Filmlook portret',
          caption: 'Half scheef, precies goed',
          rotate: 2.7,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${DISPOCAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
      ],
    },
    about: {
      title: 'Over Dispocam',
      intro:
        'Dispocam begon met een simpele irritatie: €40 kwijt aan een wegwerpcamera, drie weken wachten op je foto\'s, en daarna gooi je het ding weg. Dat moest anders kunnen: dezelfde vibe, zonder het gedoe.',
      sections: [
        {
          heading: 'Ons verhaal',
          body:
            'We wilden de magie van een wegwerpcamera terug — het klikken, het niet weten hoe het eruitziet, het moment zelf beleven. Maar dan zonder filmrolletjes, ontwikkelkosten en weken wachten. Dispocam is die camera: retro in je handen, modern onder de motorkap.',
        },
        {
          heading: 'Wat we geloven',
          body:
            'De mooiste foto\'s zijn niet perfect. Ze zijn korrelig, geflitst, half scheef, en precies zoals die avond voelde. Geen filters, geen AI — alleen echte momenten.',
        },
        {
          heading: 'Waar we naartoe werken',
          body:
            'We bouwen aan een plek waar alleen échte foto\'s bestaan. Koop je nu een Dispocam, dan ben je er straks als eerste bij.',
        },
      ],
    },
  },

  footer: {
    supportTitle: 'Uitstekende klantenservice',
    email: 'support@dispocam.nl',
    location: 'Nederland',
    brandBlock: {
      copyright: '© Dispocam · Amsterdam',
      kvk: 'KvK: [nummer]',
      email: 'hallo@dispocam.nl',
    },
    links: [
      { label: 'Algemene voorwaarden', href: '/legal/algemene-voorwaarden.html' },
      { label: 'Privacybeleid', href: '/legal/privacybeleid.html' },
      { label: 'Verzending', href: '/legal/verzending.html' },
      { label: 'Retourbeleid', href: '/legal/retourbeleid.html' },
    ],
  },
};
