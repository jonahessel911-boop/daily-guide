/**
 * 1970cam DTC checkout — content config
 */
const CAM_IMG = '/assets/product';
const CAM_GALLERY = '/assets/gallery';
const CAM_SOCIAL = '/assets/social';
const CAM_REVIEWS = '/assets/reviews';

window.HearingDTCConfig = {
  brand: {
    name: '1970cam',
    logo: null,
    logoAlt: '1970cam',
  },

  brandPage: {
    topBar: 'Gratis verzending in NL & BE · Eerste batch nu leverbaar',
    mobileCta: {
      label: '1970cam',
      button: 'Bestel nu',
    },
    tagline: 'Eén keer kopen. Jarenlang schieten. Nooit meer weggooien.',
    manifest:
      'De mooiste foto\'s zijn niet perfect. Ze zijn korrelig, geflitst, half scheef — precies zoals die avond voelde. 1970cam is de wegwerpcamera van vroeger, zonder het gedoe: geen scherm, geen rolletje, geen weggooien. Telefoon mag thuis. Schiet de party. Jij en je vrienden zien de foto\'s direct in de app.',
    founderStory: {
      title: 'Hoe 1970cam ontstond',
      paragraphs: [
        'Het begon op een verjaardag, ergens vorig jaar. De vriendin van mijn broer liet foto\'s zien van een weekendje weg, en tussendoor zei ze iets dat ik pas veel later echt hoorde: "Nee, de foto\'s van de wegwerpcamera zien we pas over een paar dagen. En het kost ook nog eens geld om ze te laten ontwikkelen."',
        'Het vloog voorbij, zoals dat gaat. Iedereen knikte, iemand pakte de taart, klaar.',
        'Maar het bleef ergens hangen. Weken later begon ik er over mijn eigen vriendin over. Ik vroeg haar of ze die camera\'s kende, en natuurlijk kende ze die. Zij en haar vriendinnen namen er eentje mee naar elk festival. En haar verhaal was letterlijk hetzelfde: veertig euro kwijt, weken wachten, de helft van de foto\'s mislukt, en daarna gooi je het ding weg. "Maar die foto\'s zijn wel de leukste die we hebben," zei ze erbij.',
        'Dat is toch gek? Het beste fotoproduct dat ik kende was ook meteen het onhandigste.',
        'Wat ze niet wist: ik had stiekem al een site gebouwd. Ik speelde de nieuwsgierige vriend, stelde nog wat vragen, en liet haar vijf minuten later mijn scherm zien. Ik wilde haar echte mening, niet de lieve versie. Ze keek er even naar, scrolde, en zei: "Oké. Dit zou ik kopen."',
        'Toen wist ik het.',
        'Nu moet ik iets bekennen: ik ben een man van 21 die een product lanceert dat vooral vrouwen gaan gebruiken. Dus heb ik het enige verstandige gedaan: heel veel vragen stellen en vooral heel goed luisteren. Naar mijn vriendin, haar vriendinnen, de vriendin van mijn broer. Elke keuze in dit product is langs hen gegaan voordat \'ie langs mij mocht.',
        'Daarna zijn we gaan bouwen. Prototypes getest, software ontwikkeld, net zo lang tot het klopte: een camera met de vibe van 1980 en de technologie van vandaag. Geen scherm, geen filters, gewoon richten en klikken zoals vroeger. Maar je foto\'s staan direct op je telefoon, ontwikkelen kost niks meer, en je gooit \'m nooit meer weg.',
        'Zo is de 1970cam ontstaan. Een oud product in een nieuw jasje, gemaakt door iemand die er vol voor gaat en geen plan B heeft.',
      ],
      author: 'Jona, oprichter van 1970cam',
      promises: [
        'Gaat \'ie kapot binnen 1 jaar? Je krijgt een nieuwe.',
        'Vind je \'m niks? Binnen 60 dagen je geld terug.',
        'Heb je een idee? Mail me: jona@1970cam.nl',
      ],
      expandAfter: 3,
    },
    visionTeaser: {
      title: 'Dit is pas het begin.',
      body:
        'We bouwen aan een plek waar alleen échte foto\'s bestaan. Geen filters, geen AI, alleen momenten geschoten met een 1970cam. Koop je nu een camera, dan ben je er straks als eerste bij.',
      note: 'De eerste 500 camera\'s zijn genummerd. Nº 001 is vergeven.',
      cta: 'Bestel je 1970cam',
    },
    mainCta: {
      title: 'Bestel je 1970cam',
      sub: 'Gratis verzending · 60 dagen thuis proberen',
    },
    shippingPromise: 'Gratis verzending in NL & BE',
  },

  guaranteeDays: 60,
  embedSocialInBenefits: false,

  deliveryBanner:
    'Telefoon thuis. 1970cam mee. Foto\'s direct in de app.',

  benefitsTitle: 'Waarom 1970cam',
  howItWorksTitle: 'Van doos tot party',

  sectionOrder: [
    'filmLook',
    'benefits',
    'manifest',
    'howItWorks',
    'socialFeed',
    'priceComparison',
    'founderStory',
    'guarantee',
    'reviews',
    'faq',
    'visionTeaser',
  ],

  product: {
    eyebrow: '1970CAM',
    headline: 'De vibe van een wegwerpcamera. Zonder wegwerpen.',
    name: '1970cam — De vibe van een wegwerpcamera. Zonder wegwerpen.',
    offerLabel: '1× 1970cam',
    shortDescription:
      'Schiet zoals vroeger — geen scherm, pure nostalgie. Foto\'s staan direct op je telefoon. Nooit meer een nieuwe camera kopen. Deel ze overal, of kijk ze samen terug in de app.',
    price: 69.99,
    originalPrice: 99.99,
    discountPercent: 30,
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
      src: `${CAM_IMG}/1970cam-front.png`,
      alt: '1970cam — retro digitale camera, vooraanzicht',
    },
    {
      src: `${CAM_IMG}/1970cam-contents.png`,
      alt: '1970cam complete set — camera, doos, USB-kabel, polsband en QR-kaart',
    },
    {
      src: `${CAM_IMG}/1970cam-benefits.png`,
      alt: '1970cam — camera met voordelen: direct op je telefoon, 1.000 foto\'s, film-look en 60 dagen garantie',
    },
    {
      src: `${CAM_IMG}/1970cam-setup.png`,
      alt: '1970cam koppelen in 1 minuut — QR scannen en direct gekoppeld op je telefoon',
    },
    {
      src: `${CAM_IMG}/1970cam-phone-gallery.png`,
      alt: '1970cam in actie — schiet zonder scherm, foto\'s direct in de app op je telefoon',
    },
  ],

  trustIcons: [
    { icon: 'trial', label: '60 dagen thuis proberen' },
    { icon: 'warranty', label: '1 jaar garantie' },
    { icon: 'setup', label: 'Opgeladen geleverd — klaar om te klikken' },
  ],

  reviewBanner: null,

  // Loaded from 1970cam-reviews.js — Real customer reviews only.
  reviews: typeof window !== 'undefined' && window.Cam1970Reviews ? window.Cam1970Reviews : [],

  filmLookSlider: {
    title: 'De look die je krijgt',
    intro:
      'Geen filter, geen bewerking, geen nabewerken op je telefoon. Elke foto komt uit de 1970cam met die echte jaren-90 film-look — korrel, warme kleuren en datumstempel incluis.',
    footer:
      'Vroeger: weken wachten. Nu: direct op je telefoon — en deelbaar overal.',
    slides: [
      {
        src: `${CAM_GALLERY}/huisfeest.png`,
        alt: 'Huisfeest met flits — retro filmlook',
        caption: 'Huisfeest, 23:47 — geschoten met flits',
      },
      {
        src: `${CAM_GALLERY}/zomer.png`,
        alt: 'Sprong van de pier bij zonsondergang',
        caption: 'De zomer die je wil onthouden',
      },
      {
        src: `${CAM_GALLERY}/festival.png`,
        alt: 'Festival in de crowd',
        caption: 'Festival — midden in de crowd',
      },
      {
        src: `${CAM_GALLERY}/roadtrip.png`,
        alt: 'Roadtrip ergens onderweg',
        caption: 'Roadtrip, ergens onderweg',
      },
      {
        src: `${CAM_GALLERY}/terras.png`,
        alt: 'Gouden uur op het terras',
        caption: 'Gouden uur op het terras',
      },
    ],
  },

  socialFeed: {
    title: 'Telefoon thuis. 1970cam mee.',
    body:
      'Koppel ’m één keer aan je telefoon. Daarna mag je telefoon thuisblijven: neem alleen de 1970cam mee naar de party, schiet de avond, en zie de foto\'s direct in de app. Jouw vrienden kunnen meekijken — of jij deelt ze overal: WhatsApp, Instagram, Stories.',
    cta: 'Eén 1970cam op tafel = de hele avond vastgelegd. Voor iedereen.',
    image: `${CAM_SOCIAL}/feed.png`,
    imageAlt: '1970cam community feed — echte film-look foto\'s van over de hele wereld',
  },

  benefitsList: [
    'Direct op je telefoon — geen ontwikkelen, geen weken wachten',
    'Nooit meer een wegwerp kopen — één camera, jarenlang meenemen',
    'Deel overal waar je wilt — WhatsApp, Instagram, Stories',
    'Telefoon thuis, 1970cam mee — jij én je vrienden kijken mee in de app',
    'Geen scherm op de camera: richten, klikken, later terugkijken',
    'Echte film-look op elke foto, zonder filters',
    '1.000 foto\'s per lading · in 30 minuten weer vol',
    '60 dagen niet-goed-geld-terug · 1 jaar garantie',
  ],

  benefits: [],

  comparisonTable: {
    title: 'Waarom 1970cam wint',
    left: {
      label: 'Wegwerpcamera',
      items: [
        'Weken wachten op ontwikkelen',
        'Elke party opnieuw kopen',
        '€15+ ontwikkelkosten, elke keer',
        'Delen? Eerst laten scannen',
        'Telefoon blijft in je hand — of je mist alles',
        'Na 27 foto\'s: afval',
      ],
    },
    right: {
      label: '1970cam',
      items: [
        'Direct op je telefoon',
        'Eén keer kopen, jarenlang meenemen',
        'Geen ontwikkelkosten. Ooit.',
        'Deel overal — of kijk samen in de app',
        'Telefoon thuis. 1970cam mee.',
        '1.000 foto\'s per lading · 60 dagen proberen',
      ],
    },
  },

  priceComparison: null,

  resultStats: [],

  howItWorks: [],

  howItWorksVisual: {
    title: 'Hoe werkt het',
    intro:
      'Drie stappen. Daarna: telefoon thuis, 1970cam mee, en schieten.',
    image: '/assets/how-it-works.png',
    imageAlt: '1970cam setup in drie stappen — uitpakken, koppelen, schieten',
    tagline: '1 minuut setup. Jarenlang meenemen.',
    steps: [
      {
        step: 1,
        title: 'Uitpakken',
        text: '1970cam, kabel en QR-kaart — opgeladen en klaar.',
      },
      {
        step: 2,
        title: 'Koppelen',
        text: 'Scan de QR met je telefoon. Eenmalig gekoppeld — klaar voor elke party.',
      },
      {
        step: 3,
        title: 'Schieten',
        text: 'Telefoon mag thuis. Schiet de avond. Jij en je vrienden zien de foto\'s direct in de app — of deel ze overal.',
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
      a: 'Je koppelt de 1970cam één keer via de QR-code. Daarna verschijnen nieuwe foto\'s in de app op je telefoon — ook als je telefoon niet mee was naar de party. Jouw vrienden kunnen meekijken in de app, of jij deelt de foto\'s overal.',
    },
    {
      q: 'Moet mijn telefoon mee naar de party?',
      a: 'Nee. Koppel ’m eenmalig, laat je telefoon gerust thuis, en neem alleen de 1970cam mee. Achteraf (of live, als iemand anders de app open heeft) zie je alles terug.',
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
      a: 'Ja. Je hebt 60 dagen om je 1970cam thuis uit te proberen. Niet tevreden? Dan krijg je je geld terug.',
    },
    {
      q: 'Is er garantie?',
      a: 'Ja, 1 jaar garantie op fabricagefouten vanaf de aankoopdatum.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: 'Je 1970cam, USB-C kabel, polsband, QR-kaart voor overzetten naar je telefoon en een korte handleiding.',
    },
  ],

  site: {
    announcement: 'Gratis verzending in NL & BE · Eerste batch nu leverbaar',
    nav: {
      shop: 'Shop',
      mission: { label: 'Onze missie', href: '/missie' },
      faq: { label: 'FAQ', href: '/checkout#faq' },
      feed: { label: 'Feed', href: '/feed' },
      support: { label: 'Support', href: 'mailto:hallo@1970cam.nl' },
    },
    megaMenu: {
      product: {
        badge: 'NU beschikbaar',
        title: '1970cam 1.0',
        image: `${CAM_IMG}/1970cam-front.png`,
        href: '/checkout',
      },
    },
    mission: {
      hint: 'Veeg het papier om — volgende pagina',
      slides: [
        {
          type: 'cover',
          label: 'Onze missie',
          title: 'Hoe 1970cam ontstond',
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
            'Zo is de 1970cam ontstaan. Een oud product in een nieuw jasje, gemaakt door iemand die er vol voor gaat en geen plan B heeft.',
          ],
        },
        {
          paragraphs: [
            'Maar de camera is pas het begin. We bouwen aan een platform waar alleen foto\'s staan die met een 1970cam zijn gemaakt — pure momenten, pure foto\'s. Geen filters, geen AI, geen perfecte kiekjes die er eigenlijk anders uitzagen. Alleen wat er écht was, geschoten met één knop en die korrelige film-look die je nergens anders krijgt. Dat is waar we naartoe werken.',
            'De foto\'s zijn nog steeds korrelig, geflitst en half scheef. Dat houden we zo. De rest hebben we sneller, slimmer en vooral heel veel vetter gemaakt.',
          ],
        },
        {
          type: 'byline',
          text: 'Jona, oprichter van 1970cam',
        },
      ],
    },
    hero: {
      image: `${CAM_GALLERY}/huisfeest.png`,
      title: 'De vibe van een wegwerpcamera.',
      subtitle: 'Zonder wegwerpen.',
      body: 'Direct op je telefoon. Nooit meer opnieuw kopen. Deel overal — of kijk samen terug in de app.',
      cta: 'Shop 1970cam',
      ctaHref: '/checkout',
    },
    products: {
      title: 'Bestsellers',
      shopAllHref: '/checkout',
      items: [
        {
          name: '1970cam',
          variant: 'Classic Black',
          price: 69.99,
          image: `${CAM_IMG}/1970cam-front.png`,
          href: '/checkout',
          badge: 'Bestseller',
        },
      ],
    },
    moments: {
      title: 'Meer 1970cam-momenten',
      items: [
        { image: `${CAM_GALLERY}/festival.png`, title: 'Festival', href: '/checkout#film-look' },
        { image: `${CAM_GALLERY}/roadtrip.png`, title: 'Roadtrip', href: '/checkout#film-look' },
        { image: `${CAM_GALLERY}/terras.png`, title: 'Terras', href: '/checkout#film-look' },
      ],
    },
    feed: {
      title: 'Feed',
      subtitle: 'Echte momenten. Geschoten met een 1970cam.',
      posts: [
        {
          id: 'f1',
          image: `${CAM_GALLERY}/huisfeest.png`,
          alt: 'Huisfeest met flits',
          caption: 'Huisfeest, 23:47 — geschoten met flits',
          rotate: -2.8,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${CAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. 1970cam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f2',
          image: `${CAM_GALLERY}/zomer.png`,
          alt: 'Sprong van de pier',
          caption: 'De zomer die je wil onthouden',
          rotate: 1.6,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${CAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
        {
          id: 'f3',
          image: `${CAM_REVIEWS}/emma-photo.png`,
          alt: 'Retro foto Emma',
          caption: 'Oude vibe, nieuwe foto\'s',
          rotate: -1.2,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${CAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. 1970cam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f4',
          image: `${CAM_GALLERY}/festival.png`,
          alt: 'Festival in de crowd',
          caption: 'Festival — midden in de crowd',
          rotate: 2.4,
          author: {
            name: 'Tom K.',
            handle: 'tomk',
            avatar: `${CAM_REVIEWS}/tomo-avatar.png`,
            bio: 'Geen scherm, geen afleiding — alleen het moment en de muziek.',
            location: 'Utrecht',
          },
        },
        {
          id: 'f5',
          image: `${CAM_GALLERY}/roadtrip.png`,
          alt: 'Roadtrip onderweg',
          caption: 'Roadtrip, ergens onderweg',
          rotate: -3.1,
          author: {
            name: 'Daan V.',
            handle: 'daanv',
            avatar: `${CAM_REVIEWS}/daan-avatar.png`,
            bio: 'Onderweg schieten, thuis terugkijken. Eén knop, geen gedoe.',
            location: 'Den Haag',
          },
        },
        {
          id: 'f6',
          image: `${CAM_REVIEWS}/lisa-photo.png`,
          alt: 'Retro foto Lisa',
          caption: 'Gisteren avond, vandaag op m\'n telefoon',
          rotate: 1.8,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${CAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
        {
          id: 'f7',
          image: `${CAM_GALLERY}/terras.png`,
          alt: 'Gouden uur op het terras',
          caption: 'Gouden uur op het terras',
          rotate: -1.9,
          author: {
            name: 'Noah B.',
            handle: 'noah_b',
            avatar: `${CAM_REVIEWS}/daan-avatar.png`,
            bio: 'Terras, wijn, en foto\'s die eruitzien alsof ze uit 1998 komen.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f8',
          image: `${CAM_GALLERY}/huisfeest.png`,
          alt: 'Flits op het dancefloor',
          caption: '23:47 — niemand wist dat dit eruit zou zien',
          rotate: 2.1,
          author: {
            name: 'Tom K.',
            handle: 'tomk',
            avatar: `${CAM_REVIEWS}/tomo-avatar.png`,
            bio: 'Geen scherm, geen afleiding — alleen het moment en de muziek.',
            location: 'Utrecht',
          },
        },
        {
          id: 'f9',
          image: `${CAM_REVIEWS}/daan-photo.png`,
          alt: 'Retro foto Daan',
          caption: 'Klik, leef verder',
          rotate: -2.2,
          author: {
            name: 'Daan V.',
            handle: 'daanv',
            avatar: `${CAM_REVIEWS}/daan-avatar.png`,
            bio: 'Onderweg schieten, thuis terugkijken. Eén knop, geen gedoe.',
            location: 'Den Haag',
          },
        },
        {
          id: 'f10',
          image: `${CAM_GALLERY}/zomer.png`,
          alt: 'Zomer aan het water',
          caption: 'Sprong. Klik. Klaar.',
          rotate: 3,
          author: {
            name: 'Sofie L.',
            handle: 'sofie_l',
            avatar: `${CAM_REVIEWS}/emma-avatar.png`,
            bio: 'Alles wat ik wil onthouden, schiet ik met m\'n 1970cam.',
            location: 'Groningen',
          },
        },
        {
          id: 'f11',
          image: `${CAM_GALLERY}/festival.png`,
          alt: 'Crowd shot festival',
          caption: 'Main stage, 01:12',
          rotate: -1.5,
          author: {
            name: 'Noah B.',
            handle: 'noah_b',
            avatar: `${CAM_REVIEWS}/daan-avatar.png`,
            bio: 'Terras, wijn, en foto\'s die eruitzien alsof ze uit 1998 komen.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f12',
          image: `${CAM_GALLERY}/roadtrip.png`,
          alt: 'Underweg met vrienden',
          caption: 'Ergens tussen Utrecht en nergens',
          rotate: 1.3,
          author: {
            name: 'Emma R.',
            handle: 'emma_r',
            avatar: `${CAM_REVIEWS}/emma-avatar.png`,
            bio: 'Feestjes, flits en alles daartussen. 1970cam op tafel = hele avond vastgelegd.',
            location: 'Amsterdam',
          },
        },
        {
          id: 'f13',
          image: `${CAM_GALLERY}/terras.png`,
          alt: 'Avond op het terras',
          caption: 'Vrijdagavond, geen filter nodig',
          rotate: -2.6,
          author: {
            name: 'Sofie L.',
            handle: 'sofie_l',
            avatar: `${CAM_REVIEWS}/emma-avatar.png`,
            bio: 'Alles wat ik wil onthouden, schiet ik met m\'n 1970cam.',
            location: 'Groningen',
          },
        },
        {
          id: 'f14',
          image: `${CAM_REVIEWS}/lisa-photo.png`,
          alt: 'Filmlook portret',
          caption: 'Half scheef, precies goed',
          rotate: 2.7,
          author: {
            name: 'Lisa M.',
            handle: 'lisam',
            avatar: `${CAM_REVIEWS}/lisa-avatar.png`,
            bio: 'Zonsondergangen, pieren en vrienden die je niet wilt vergeten.',
            location: 'Rotterdam',
          },
        },
      ],
    },
    about: {
      title: 'Over 1970cam',
      intro:
        '1970cam begon met een simpele irritatie: €40 kwijt aan een wegwerpcamera, drie weken wachten op je foto\'s, en daarna gooi je het ding weg. Dat moest anders kunnen: dezelfde vibe, zonder het gedoe.',
      sections: [
        {
          heading: 'Ons verhaal',
          body:
            'We wilden de magie van een wegwerpcamera terug — het klikken, het niet weten hoe het eruitziet, het moment zelf beleven. Maar dan zonder filmrolletjes, ontwikkelkosten en weken wachten. 1970cam is die camera: retro in je handen, modern onder de motorkap.',
        },
        {
          heading: 'Wat we geloven',
          body:
            'De mooiste foto\'s zijn niet perfect. Ze zijn korrelig, geflitst, half scheef, en precies zoals die avond voelde. Geen filters, geen AI — alleen echte momenten.',
        },
        {
          heading: 'Waar we naartoe werken',
          body:
            'We bouwen aan een plek waar alleen échte foto\'s bestaan. Koop je nu een 1970cam, dan ben je er straks als eerste bij.',
        },
      ],
    },
  },

  footer: {
    supportTitle: 'Uitstekende klantenservice',
    email: 'support@1970cam.nl',
    location: 'Nederland',
    brandBlock: {
      copyright: '© 1970cam · Amsterdam',
      kvk: 'KvK: 8297372',
      email: 'hallo@1970cam.nl',
    },
    links: [
      { label: 'Algemene voorwaarden', href: '/legal/algemene-voorwaarden.html' },
      { label: 'Privacybeleid', href: '/legal/privacybeleid.html' },
      { label: 'Verzending', href: '/legal/verzending.html' },
      { label: 'Retourbeleid', href: '/legal/retourbeleid.html' },
    ],
  },
};
