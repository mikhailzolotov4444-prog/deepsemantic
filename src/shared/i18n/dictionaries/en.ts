/**
 * English texts. This file defines the SHAPE of a dictionary: ru.ts must provide the same keys,
 * and TypeScript refuses to build if something is missing.
 */
export const en = {
  site: {
    tagline: "English lessons and teaching materials",
    description:
      "Personal website of an English teacher: lessons, teaching materials and resources for learners of all levels.",
    defaultTitle: "English teacher",
  },
  a11y: {
    skipLink: "Skip to main content",
  },
  nav: {
    main: "Main",
    legal: "Legal",
    home: "Home",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    themeToggle: "Toggle dark mode",
    language: "Language",
  },
  home: {
    h1: "English, taught with care.",
    ctaLesson: "Request a lesson",
    ctaAbout: "About me",
    offersHeading: "How I can help",
    offers: [
      {
        title: "One-to-one lessons",
        text: "Lessons built around your goals, whether that is exams, work, travel or simply speaking with confidence. Send a request and I will get back to you.",
      },
      {
        title: "Teaching materials",
        text: "Worksheets, lesson plans and grammar guides organised by level, from A1 to C2. The library is coming soon.",
      },
      {
        title: "Questions and collaboration",
        text: "Parents, schools and fellow teachers are welcome to get in touch about lessons, materials or working together.",
      },
    ],
    testimonialsHeading: "Kind words",
    readyHeading: "Ready to start?",
    readyText:
      "Tell me about your level and your goals, and we will find the right way to work together.",
    readyButton: "Get in touch",
  },
  about: {
    metaDescription: "Background, qualifications and teaching approach.",
    h1: "About me",
    qualifications: "Qualifications",
    experience: "Experience",
    links: "Find me online",
    togetherHeading: "Let’s work together",
    togetherText: "Send me a message and I will reply as soon as I can.",
    togetherButton: "Contact me",
    jobTitle: "English teacher",
  },
  contact: {
    metaDescription: "Request a lesson or ask a question.",
    h1: "Contact",
    intro:
      "Request a lesson, ask about teaching materials or just say hello. I will reply by email.",
    unavailable: "The contact form is not available yet. Please check back soon.",
    form: {
      name: "Name",
      email: "Email",
      topic: "Topic",
      message: "Message",
      honeypot: "Leave this field empty",
      send: "Send message",
      sending: "Sending…",
      thanksTitle: "Thank you!",
      thanksText: "Your message has been sent. I will get back to you soon.",
      privacyBefore: "I use your name and email only to reply to you. See the",
      privacyLink: "privacy policy",
      privacyAfter: ".",
    },
    topics: {
      lessons: "Lessons",
      materials: "Teaching materials",
      other: "Something else",
    },
    fieldErrors: {
      name_required: "Please enter your name.",
      name_too_long: "Please use at most 100 characters.",
      email_invalid: "Please enter a valid email address.",
      topic_invalid: "Please choose a topic.",
      message_too_short: "Please write at least 10 characters.",
      message_too_long: "Please use at most 5000 characters.",
    },
    notices: {
      validation: "Please check the highlighted fields.",
      unavailable: "The contact form is not available yet. Please check back soon.",
      spam: "Please complete the verification and try again.",
      delivery: "Your message could not be sent right now. Please try again in a few minutes.",
      unknown: "Something went wrong. Please try again in a few minutes.",
    },
  },
  privacy: {
    metaTitle: "Privacy policy",
    metaDescription: "How this website handles your personal data.",
    h1: "Privacy policy",
    draftLabel: "Draft template.",
    draftText:
      "This text describes what the website does today, but it is not legal advice. Have a lawyer review and complete it (including the parts in square brackets) before the site is made public.",
    sections: [
      {
        id: "who",
        title: "Who is responsible",
        paragraphs: [
          "[Your full name or business name, address and contact email] is responsible for the personal data described here.",
        ],
        items: [] as string[],
      },
      {
        id: "what",
        title: "What data is collected",
        paragraphs: [
          "The website does not use advertising cookies or tracking. [Update this section if analytics are added.]",
        ],
        items: [
          "Contact form: the name, email address and message you type, so that I can reply to you. [State whether messages are also stored in a database or only delivered by email.]",
          "Spam protection: when the contact form is protected by Cloudflare Turnstile, your browser connects to Cloudflare and shares technical information (such as your IP address) so that bots can be told apart from people.",
          "Colour theme: if you switch between light and dark mode, your choice is remembered in your browser. It is not sent to me.",
        ],
      },
      {
        id: "why",
        title: "Why and for how long",
        paragraphs: [
          "Your message is used only to answer you. [State how long messages are kept, for example “deleted after 12 months”.]",
        ],
        items: [],
      },
      {
        id: "providers",
        title: "Service providers",
        paragraphs: [
          "[List the providers that process data for this site, their countries and purpose: for example hosting, email delivery, database, spam protection.]",
        ],
        items: [],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "You can ask me to show, correct or delete the data I hold about you. [Add the contact address for such requests and any rights that apply in your country.]",
        ],
        items: [],
      },
    ],
  },
  terms: {
    metaTitle: "Terms of use",
    metaDescription: "Terms for using this website and its materials.",
    h1: "Terms of use",
    draftLabel: "Draft template.",
    draftText:
      "This is a starting point, not legal advice. Have it reviewed and completed before the site is made public. Add refund and payment terms before any products are sold.",
    sections: [
      {
        id: "use",
        title: "Using this website",
        paragraphs: [
          "The content of this website is provided for general information and for learning English. [Describe any limits, for example that lesson availability is not guaranteed.]",
        ],
        items: [] as string[],
      },
      {
        id: "materials",
        title: "Teaching materials",
        paragraphs: [
          "[State what visitors may do with downloaded materials, for example personal and classroom use, and what they may not do, such as reselling or republishing them.]",
        ],
        items: [],
      },
      {
        id: "liability",
        title: "Responsibility",
        paragraphs: ["[Add a statement of liability that is valid in your country.]"],
        items: [],
      },
      {
        id: "questions",
        title: "Questions",
        paragraphs: ["Please use the contact page if anything here is unclear."],
        items: [],
      },
    ],
  },
};

export type Dictionary = typeof en;
