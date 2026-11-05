import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { User, IUser } from "../models/User";
import { Idea } from "../models/Idea";
import { Analysis } from "../models/Analysis";
import { analyzeIdea } from "../services/analysisEngine";
import type { Stage } from "../models/Idea";

export const DEMO_EMAIL = "demo@startup-tester.com";
export const DEMO_PASSWORD = "Demo1234!";

interface Version {
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: Stage;
}

interface DemoIdea {
  title: string;
  /** Oldest first. Each version gets a stress test; the idea ends on the last one. */
  versions: Version[];
  /** Days between versions, so the history looks like real iteration. */
  daysBetween: number;
}

/**
 * Showcase ideas. Every score shown in the demo is computed by the real engine
 * on these texts — the progression between versions is genuine, not typed in.
 */
export const DEMO_IDEAS: DemoIdea[] = [
  {
    title: "Récolte — l'anti-gaspillage pour restaurants",
    daysBetween: 9,
    versions: [
      {
        description: "Une application pour aider les restaurants à moins jeter de nourriture.",
        marketSizeEstimate: "Le marché de la restauration est grand.",
        teamSummary: "Deux amis motivés.",
        techStack: "Application mobile",
        revenueModel: "On verra plus tard, peut-être de la publicité.",
        stage: "idea",
      },
      {
        description:
          "Une plateforme qui aide les restaurants indépendants à prévoir leurs commandes de produits frais à partir de leur historique de ventes et de la météo. " +
          "Le gérant reçoit chaque matin une liste de commande conseillée et voit combien il a évité de jeter. Les invendus restants sont proposés à des associations partenaires.",
        marketSizeEstimate: "175 000 restaurants en France, dont 70 % indépendants ; marché mondial du logiciel de restauration estimé à plusieurs milliards.",
        teamSummary: "Cofondatrice CEO, 8 ans d'expérience en gestion de restaurants ; cofondateur CTO, ingénieur logiciel.",
        techStack: "React, Node.js, PostgreSQL, Python pour la prévision, hébergé sur AWS",
        revenueModel: "Abonnement mensuel de 59 € par établissement.",
        stage: "prototype",
      },
      {
        description:
          "Une plateforme qui aide les restaurants indépendants à prévoir leurs commandes de produits frais à partir de leur historique de caisse, de la météo et des événements locaux. " +
          "Chaque matin, le gérant reçoit une commande conseillée par fournisseur et voit en euros ce qu'il a évité de jeter. Les invendus sont proposés automatiquement à des associations partenaires, avec reçu fiscal. " +
          "Cible : restaurants indépendants de 20 à 80 couverts, souvent sans gestionnaire de stock. Acquisition : partenariat avec deux grossistes régionaux, contenu SEO sur le coût du gaspillage et parrainage entre restaurateurs. " +
          "Contrairement aux outils de gestion de stock classiques, Récolte se branche directement sur la caisse et ne demande aucune saisie : c'est notre avantage principal.",
        marketSizeEstimate:
          "175 000 restaurants en France dont 120 000 indépendants ; 30 000 dans notre cible de départ × 708 € par an = 21 M€ en France, plusieurs milliards au niveau mondial.",
        teamSummary:
          "Cofondatrice CEO, 8 ans d'expérience en direction de restaurants ; cofondateur CTO, ingénieur senior ex-éditeur de logiciels de caisse ; un data scientist à mi-temps ; mentor : ancien directeur commercial d'un grossiste.",
        techStack: "React, TypeScript, Node.js, PostgreSQL, Python (prévision), API des caisses, Docker sur AWS, cache Redis",
        revenueModel: "Abonnement SaaS mensuel récurrent : 59 € par établissement, 49 € en engagement annuel ; offre groupes B2B sur devis.",
        stage: "mvp",
      },
    ],
  },
  {
    title: "Kinésio+ — la rééducation guidée à domicile",
    daysBetween: 12,
    versions: [
      {
        description: "Une application qui montre des exercices de rééducation en vidéo aux patients entre deux séances de kiné.",
        marketSizeEstimate: "Beaucoup de patients font de la rééducation.",
        teamSummary: "Un kinésithérapeute.",
        techStack: "Flutter",
        revenueModel: "Gratuit pour commencer.",
        stage: "idea",
      },
      {
        description:
          "Une application qui permet aux kinésithérapeutes de prescrire un programme d'exercices vidéo à leurs patients et de suivre leur assiduité entre les séances. " +
          "Le patient filme ses mouvements, l'IA vérifie l'amplitude et le kiné reçoit un résumé hebdomadaire. Cible : cabinets libéraux et patients après une opération du genou ou de l'épaule. " +
          "Acquisition par les communautés de kinés en ligne, des partenariats avec les écoles et le bouche-à-oreille entre confrères.",
        marketSizeEstimate: "90 000 kinésithérapeutes en France ; marché mondial de la rééducation numérique estimé à plusieurs milliards de dollars.",
        teamSummary: "Cofondateur CEO kinésithérapeute, 12 ans d'expérience ; cofondatrice CTO, ingénieure en vision par ordinateur.",
        techStack: "Flutter, Python, PostgreSQL, API vidéo, cloud AWS",
        revenueModel: "Abonnement mensuel de 39 € par praticien ; licence pour les cliniques.",
        stage: "prototype",
      },
    ],
  },
  {
    title: "FacturePilot — les relances de factures en pilote automatique",
    daysBetween: 7,
    versions: [
      {
        description:
          "Un logiciel SaaS qui se connecte à la banque et à l'outil de facturation des indépendants et des petites entreprises, détecte les factures impayées et envoie des relances polies puis fermes au bon moment, par e-mail et SMS. " +
          "Le tableau de bord montre le délai moyen de paiement par client et prévient avant qu'un retard ne devienne critique. " +
          "Cible : indépendants et TPE de services qui facturent plus de 10 clients par mois. Acquisition : SEO sur les modèles de relance, partenariats avec les experts-comptables, programme de parrainage. " +
          "Contrairement aux logiciels de facturation, FacturePilot ne gère que le recouvrement et le fait mieux : c'est le premier outil de relance pensé pour les indépendants.",
        marketSizeEstimate:
          "3,5 millions d'indépendants et 1,2 million de TPE en France ; 400 000 dans notre cible × 180 € par an = 72 M€ ; marché mondial du recouvrement logiciel de plusieurs milliards.",
        teamSummary:
          "Cofondateur CEO, 10 ans d'expérience en cabinet d'expertise comptable ; cofondatrice CTO, ingénieure senior ex-fintech ; responsable marketing et ventes à temps partiel.",
        techStack: "React, TypeScript, Node.js, PostgreSQL, API bancaires DSP2, files de messages, Docker, AWS",
        revenueModel: "Abonnement SaaS mensuel : 15 € pour les indépendants, 49 € pour les TPE, réduction annuelle ; revenus récurrents.",
        stage: "growth",
      },
    ],
  },
  {
    title: "Cargo Vert — la livraison urbaine en vélo cargo",
    daysBetween: 10,
    versions: [
      {
        description:
          "Un service de livraison du dernier kilomètre en vélo cargo électrique pour les commerçants de centre-ville. " +
          "Nous gérons un entrepôt urbain, la flotte de vélos, l'inventaire en transit et le recrutement des livreurs. Activité réglementée selon les zones à faibles émissions.",
        marketSizeEstimate: "Le marché de la livraison urbaine est en croissance dans les grandes villes.",
        teamSummary: "Un fondateur ancien coursier.",
        techStack: "Application de tournées",
        revenueModel: "Prix par livraison.",
        stage: "idea",
      },
    ],
  },
  {
    title: "Atelier Local — réserver un artisan en deux clics",
    daysBetween: 0,
    versions: [
      {
        description:
          "Une plateforme qui permet aux particuliers de réserver un artisan vérifié du quartier (plombier, électricien, serrurier) avec un prix affiché à l'avance et un créneau garanti. " +
          "Les artisans reçoivent des demandes qualifiées sans démarchage et sont payés à la fin de l'intervention.",
        marketSizeEstimate: "Plus de 600 000 entreprises artisanales du bâtiment en France ; marché du dépannage à domicile de plusieurs milliards d'euros.",
        teamSummary: "Cofondateur CEO, 6 ans d'expérience dans une marketplace de services ; cofondateur CTO, développeur full-stack.",
        techStack: "React, Node.js, MongoDB, Stripe, cloud GCP",
        revenueModel: "Commission de 12 % par intervention ; abonnement premium pour les artisans.",
        stage: "prototype",
      },
    ],
  },
];

/** How long a visitor's demo space lives before it is purged. */
export const DEMO_TTL_HOURS = 24;

/** Copies the showcase ideas and their report history into one user's space. */
async function seedShowcase(userId: Types.ObjectId): Promise<void> {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const [ideaIndex, demo] of DEMO_IDEAS.entries()) {
    const last = demo.versions[demo.versions.length - 1];
    const untested = demo.daysBetween === 0;
    const firstAt = new Date(now - (demo.versions.length * demo.daysBetween + ideaIndex) * day);

    const idea = await Idea.create({ ...last, title: demo.title, userId });
    // Backdate the idea so "edited since last report" stays false.
    await Idea.collection.updateOne({ _id: idea._id }, { $set: { createdAt: firstAt, updatedAt: firstAt } });
    if (untested) continue;

    for (const [i, version] of demo.versions.entries()) {
      const at = new Date(firstAt.getTime() + (i * demo.daysBetween + 1) * day);
      const result = analyzeIdea({ ...version, title: demo.title });
      const created = await Analysis.create({ ideaId: idea._id, userId, ...result, engine: "rules" });
      await Analysis.collection.updateOne({ _id: created._id }, { $set: { createdAt: at, updatedAt: at } });
    }
  }
}

/**
 * Creates a fresh, private demo space for one visitor: a temporary user that
 * already holds the showcase ideas and reports. Everything works in it —
 * create, edit, delete, run tests — and nobody else sees the changes.
 */
export async function createDemoSpace(): Promise<IUser> {
  const user = await User.create({
    email: `visiteur-${randomUUID()}@demo.startup-stress-tester.app`,
    password: randomUUID(), // never used: demo spaces are opened by token only
    fullName: "Visiteur démo",
    isDemo: true,
    demoExpiresAt: new Date(Date.now() + DEMO_TTL_HOURS * 60 * 60 * 1000),
  });
  await seedShowcase(user._id as Types.ObjectId);
  return user;
}

/** Deletes demo spaces past their expiry, with their ideas and reports. Returns how many. */
export async function purgeExpiredDemoSpaces(now = new Date()): Promise<number> {
  // A demo user without an expiry date can only be a leftover: it is disposable too.
  const expired = await User.find({
    isDemo: true,
    $or: [{ demoExpiresAt: { $lte: now } }, { demoExpiresAt: { $exists: false } }],
  }).select("_id");
  if (expired.length === 0) return 0;
  const ids = expired.map((u) => u._id);
  await Promise.all([Analysis.deleteMany({ userId: { $in: ids } }), Idea.deleteMany({ userId: { $in: ids } })]);
  await User.deleteMany({ _id: { $in: ids } });
  return ids.length;
}

let lastPurgeAt = 0;

/**
 * Purges expired demo spaces at most once an hour per process. Called when a
 * demo opens, so cleanup also happens on serverless hosts with no timer.
 */
export async function purgeExpiredDemoSpacesThrottled(): Promise<void> {
  if (Date.now() - lastPurgeAt < 60 * 60 * 1000) return;
  lastPurgeAt = Date.now();
  await purgeExpiredDemoSpaces().catch((err) => console.error("Demo purge failed:", err));
}

/** Purges expired demo spaces now and then every hour, for the life of the process. */
export function scheduleDemoPurge(): void {
  const run = () =>
    purgeExpiredDemoSpaces().catch((err) => console.error("Demo purge failed:", err));
  void run();
  setInterval(run, 60 * 60 * 1000).unref();
}
