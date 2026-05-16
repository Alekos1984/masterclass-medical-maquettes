export const metadata = { title: "CGU Formateurs — Masterclass Médical" };

export default function CguFormateurPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>Conditions Générales d&apos;Utilisation — Formateurs</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>Version en vigueur au 1er mai 2026 — À lire attentivement avant toute utilisation de la plateforme</p>

      <Section title="Préambule">
        <p>La société [Raison sociale] (ci-après « <strong>Masterclass Médical</strong> » ou « <strong>la Plateforme</strong> ») exploite une plateforme numérique d&apos;intermédiation destinée aux professionnels de santé.</p>
        <p><strong>Masterclass Médical n&apos;est pas un organisme de formation au sens de l&apos;article L. 6351-1 du Code du travail.</strong> Elle n&apos;organise, ne finance et ne dispense aucune formation. Son rôle est exclusivement celui d&apos;un intermédiaire technique mettant en relation des professionnels de santé souhaitant partager leur expertise (ci-après « <strong>Formateurs</strong> ») avec d&apos;autres professionnels souhaitant participer à leurs formations (ci-après « <strong>Participants</strong> »).</p>
        <p>La Plateforme fournit aux Formateurs un écosystème d&apos;outils numériques : référencement de formations, gestion des inscriptions, génération automatisée de documents réglementaires, traitement des paiements via le prestataire Stripe.</p>
        <p>Les présentes Conditions Générales d&apos;Utilisation (ci-après « <strong>CGU</strong> ») régissent les relations entre Masterclass Médical et les Formateurs.</p>
      </Section>

      <Section title="Article 1 — Définitions">
        <ul>
          <li><strong>Plateforme :</strong> le service en ligne accessible à l&apos;adresse masterclass-medical.fr et ses sous-domaines.</li>
          <li><strong>Formateur :</strong> tout professionnel de santé inscrit sur la Plateforme en qualité de prestataire de formation.</li>
          <li><strong>Participant :</strong> tout professionnel de santé s&apos;inscrivant à une formation publiée sur la Plateforme.</li>
          <li><strong>Formation :</strong> toute action de formation au sens de l&apos;article L. 6313-1 du Code du travail organisée et dispensée par un Formateur.</li>
          <li><strong>Convention de formation :</strong> contrat bilatéral conclu entre le Formateur et le Participant, généré par les outils de la Plateforme, au titre de l&apos;article L. 6353-1 du Code du travail.</li>
          <li><strong>Compte Formateur :</strong> espace personnel sécurisé du Formateur sur la Plateforme.</li>
        </ul>
      </Section>

      <Section title="Article 2 — Inscription et conditions d'accès">
        <p>L&apos;accès au Compte Formateur est réservé aux personnes physiques titulaires d&apos;un numéro RPPS valide ou aux personnes morales régulièrement immatriculées exerçant dans le secteur de la santé.</p>
        <p>Le Formateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription, notamment :</p>
        <ul>
          <li>son identité (nom, prénom, titre professionnel) ;</li>
          <li>son numéro RPPS ;</li>
          <li>son SIRET ou celui de sa structure d&apos;exercice ;</li>
          <li>ses coordonnées professionnelles.</li>
        </ul>
        <p>Masterclass Médical se réserve le droit de suspendre ou de supprimer tout compte dont les informations s&apos;avèrent inexactes ou frauduleuses.</p>
        <p>Le Formateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute connexion effectuée depuis son compte est présumée effectuée par lui.</p>
      </Section>

      <Section title="Article 3 — Rôle de la Plateforme et absence de statut d'organisme de formation">
        <p>Masterclass Médical intervient exclusivement en qualité de <strong>prestataire de services numériques d&apos;intermédiation</strong>. À ce titre :</p>
        <ul>
          <li>elle n&apos;est pas partie à la convention de formation professionnelle conclue entre le Formateur et le Participant ;</li>
          <li>elle ne garantit pas la conformité des formations aux exigences du Développement Professionnel Continu (DPC) ni à aucune autre obligation réglementaire ;</li>
          <li>elle n&apos;est pas responsable de la qualité pédagogique, de la véracité des contenus ni des résultats obtenus par les Participants ;</li>
          <li>elle ne fournit aucun service de conseil juridique, fiscal ou social en lien avec l&apos;activité de formation du Formateur.</li>
        </ul>
        <p>Le Formateur demeure seul responsable :</p>
        <ul>
          <li>de l&apos;organisation, du déroulement et du contenu pédagogique de ses formations ;</li>
          <li>du respect de toutes les obligations légales et réglementaires applicables à son activité de formation (Qualiopi le cas échéant, déclaration préalable d&apos;activité, conventions de formation, attestations de présence, etc.) ;</li>
          <li>de sa propre qualité d&apos;organisme de formation s&apos;il entend opérer à ce titre.</li>
        </ul>
      </Section>

      <Section title="Article 4 — Publication d'une formation">
        <p>Le Formateur peut publier des formations depuis son Compte en renseignant les informations requises (titre, spécialité, programme, objectifs, lieu, date, horaires, prix HT, places disponibles).</p>
        <p>En publiant une formation, le Formateur :</p>
        <ul>
          <li>garantit que les informations communiquées sont exactes et non trompeuses ;</li>
          <li>garantit détenir les droits nécessaires sur les contenus partagés ;</li>
          <li>accepte que la formation soit référencée et visible dans le catalogue public de la Plateforme ;</li>
          <li>s&apos;engage à honorer les formations pour lesquelles des inscriptions ont été enregistrées.</li>
        </ul>
        <p>Masterclass Médical se réserve le droit de retirer tout contenu illicite, inexact ou contraire à l&apos;éthique médicale, sans préavis ni indemnité.</p>
      </Section>

      <Section title="Article 5 — Documents réglementaires générés par la Plateforme">
        <p>La Plateforme génère automatiquement, à titre d&apos;outils numériques d&apos;aide, les documents suivants :</p>
        <ul>
          <li>Convention individuelle de formation (entre le Formateur et chaque Participant) ;</li>
          <li>Convocation ;</li>
          <li>Feuille d&apos;émargement ;</li>
          <li>Attestation de présence / Certificat de réalisation ;</li>
          <li>Bilan pédagogique.</li>
        </ul>
        <p>Ces documents sont produits sur la base des informations renseignées par le Formateur. Masterclass Médical ne garantit pas leur conformité aux exigences spécifiques d&apos;un financeur particulier (OPCO, ANDPC, etc.). Il appartient au Formateur de vérifier leur conformité avant usage.</p>
        <p>Les documents générés sont cryptographiquement scellés (HMAC-SHA256) et chiffrés (RC4-128 bits) afin d&apos;en garantir l&apos;intégrité et de prévenir toute altération ultérieure.</p>
      </Section>

      <Section title="Article 6 — Paiements et commissions">
        <p>Les inscriptions aux formations payantes donnent lieu à un paiement en ligne via la solution Stripe. Masterclass Médical agit en qualité d&apos;intermédiaire de paiement pour le compte du Formateur.</p>
        <p>Le prix de la formation est fixé librement par le Formateur, hors taxes (HT). En cas d&apos;exonération de TVA (formations professionnelles dispensées par des formateurs non assujettis à la TVA au titre de l&apos;article 261-4-4° du CGI), le Formateur en atteste sous sa seule responsabilité.</p>
        <p>Masterclass Médical perçoit une commission de <strong>20 % HT</strong> sur le montant de chaque inscription payante, au titre des services d&apos;intermédiation. Le Formateur perçoit les <strong>80 % restants</strong>, déduction faite des frais de traitement Stripe.</p>
        <p>Les virements sont effectués selon les modalités précisées lors de l&apos;onboarding Stripe Connect du Formateur. Masterclass Médical n&apos;est pas responsable des délais de traitement bancaire.</p>
        <p>En cas d&apos;annulation d&apos;une formation par le Formateur après paiement des Participants, le Formateur s&apos;engage à rembourser intégralement les Participants. Masterclass Médical reversera au Formateur les fonds correspondants déduction faite de la commission, ou restituera directement les fonds aux Participants selon les modalités Stripe applicables.</p>
      </Section>

      <Section title="Article 7 — Obligations déontologiques et éthiques">
        <p>Le Formateur s&apos;engage à :</p>
        <ul>
          <li>respecter le Code de déontologie de sa profession ;</li>
          <li>ne pas diffuser de contenus contraires à la santé publique, au droit médical applicable ou aux recommandations des autorités sanitaires ;</li>
          <li>ne pas utiliser la Plateforme à des fins de démarchage commercial illicite ;</li>
          <li>ne pas solliciter les Participants hors de la Plateforme aux fins de contourner les présentes CGU.</li>
        </ul>
      </Section>

      <Section title="Article 8 — Responsabilité du Formateur">
        <p>Le Formateur est seul responsable :</p>
        <ul>
          <li>de l&apos;exactitude des informations publiées et des documents remis aux Participants ;</li>
          <li>du respect de ses obligations fiscales et sociales liées à son activité de formation ;</li>
          <li>de tout dommage causé à un Participant dans le cadre d&apos;une formation qu&apos;il organise ;</li>
          <li>de la détention d&apos;une assurance responsabilité civile professionnelle couvrant son activité de formateur.</li>
        </ul>
      </Section>

      <Section title="Article 9 — Suspension et résiliation du compte">
        <p>Le Formateur peut clôturer son compte à tout moment depuis ses paramètres ou par demande écrite à <a href="mailto:contact@masterclass-medical.fr">contact@masterclass-medical.fr</a>. La clôture ne prend effet qu&apos;à l&apos;issue des formations en cours.</p>
        <p>Masterclass Médical peut suspendre ou résilier un Compte Formateur, sans préavis ni indemnité, en cas de :</p>
        <ul>
          <li>violation des présentes CGU ;</li>
          <li>fourniture d&apos;informations fausses ou frauduleuses ;</li>
          <li>comportement portant atteinte à l&apos;image ou au fonctionnement de la Plateforme ;</li>
          <li>décision judiciaire ou administrative l&apos;imposant.</li>
        </ul>
      </Section>

      <Section title="Article 10 — Propriété intellectuelle">
        <p>Masterclass Médical conserve la propriété exclusive de la Plateforme (code source, design, marques, algorithmes). Le Formateur bénéficie d&apos;une licence d&apos;utilisation personnelle, non exclusive et non cessible, limitée aux fonctionnalités auxquelles il a accès.</p>
        <p>Le Formateur conserve la propriété de ses contenus pédagogiques et concède à Masterclass Médical une licence d&apos;affichage non exclusive, à titre gratuit, pour les seuls besoins du référencement dans le catalogue.</p>
      </Section>

      <Section title="Article 11 — Données personnelles">
        <p>Le traitement des données personnelles du Formateur et de ses Participants est régi par la <a href="/legal/confidentialite">Politique de confidentialité</a> de la Plateforme.</p>
        <p>Dans le cadre de l&apos;organisation de ses formations, le Formateur est susceptible d&apos;être qualifié de responsable de traitement au sens du RGPD pour les données de ses Participants. Il lui appartient de respecter ses propres obligations au titre du RGPD.</p>
      </Section>

      <Section title="Article 12 — Modifications des CGU">
        <p>Masterclass Médical se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions seront notifiées au Formateur par email avec un préavis de 30 jours. L&apos;utilisation de la Plateforme après ce délai vaut acceptation des nouvelles conditions. À défaut d&apos;acceptation, le Formateur peut clôturer son compte.</p>
      </Section>

      <Section title="Article 13 — Droit applicable et litiges">
        <p>Les présentes CGU sont soumises au droit français.</p>
        <p>En cas de différend, les parties s&apos;engagent à rechercher une solution amiable dans un délai de 30 jours à compter de la notification du litige par lettre recommandée avec accusé de réception. À défaut d&apos;accord amiable, le litige sera soumis aux tribunaux compétents du ressort du siège social de Masterclass Médical.</p>
      </Section>

      <p style={{ marginTop: 48, color: "#888", fontSize: 13 }}>Dernière mise à jour : mai 2026</p>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #eee" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}
