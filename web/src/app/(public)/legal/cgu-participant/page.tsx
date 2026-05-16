export const metadata = { title: "CGU Participants — Masterclass Médical" };

export default function CguParticipantPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>Conditions Générales d&apos;Utilisation — Participants</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>Version en vigueur au 1er mai 2026 — À lire attentivement avant toute inscription à une formation</p>

      <Section title="Préambule">
        <p>La société [Raison sociale] (ci-après « <strong>Masterclass Médical</strong> » ou « <strong>la Plateforme</strong> ») exploite une plateforme numérique d&apos;intermédiation destinée aux professionnels de santé.</p>
        <p><strong>Masterclass Médical n&apos;est pas un organisme de formation.</strong> Elle ne dispense, n&apos;organise et ne finance aucune formation. Son rôle est exclusivement celui d&apos;un intermédiaire technique : elle met à disposition un catalogue de formations proposées par des professionnels de santé (ci-après « <strong>Formateurs</strong> »), permet aux Participants de s&apos;y inscrire et facilite le traitement des paiements via le prestataire Stripe.</p>
        <p>Le contrat de formation est conclu <strong>directement et exclusivement entre le Formateur et le Participant</strong>. Masterclass Médical n&apos;est pas partie à ce contrat et n&apos;en garantit pas l&apos;exécution.</p>
        <p>Les présentes Conditions Générales d&apos;Utilisation (ci-après « <strong>CGU</strong> ») régissent les relations entre Masterclass Médical et les Participants.</p>
      </Section>

      <Section title="Article 1 — Définitions">
        <ul>
          <li><strong>Plateforme :</strong> le service en ligne accessible à l&apos;adresse masterclass-medical.fr et ses sous-domaines.</li>
          <li><strong>Participant :</strong> tout professionnel de santé inscrit sur la Plateforme afin de s&apos;inscrire à des formations.</li>
          <li><strong>Formateur :</strong> tout professionnel de santé proposant des formations via la Plateforme.</li>
          <li><strong>Formation :</strong> toute action de formation organisée et dispensée par un Formateur et référencée dans le catalogue de la Plateforme.</li>
          <li><strong>Convention de formation :</strong> contrat bilatéral entre le Formateur et le Participant au titre de l&apos;article L. 6353-1 du Code du travail.</li>
          <li><strong>Compte Participant :</strong> espace personnel sécurisé du Participant sur la Plateforme.</li>
        </ul>
      </Section>

      <Section title="Article 2 — Inscription et conditions d'accès">
        <p>L&apos;accès au Compte Participant est réservé aux professionnels de santé exerçant en France. Le Participant s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription, notamment :</p>
        <ul>
          <li>son identité (nom, prénom, titre professionnel) ;</li>
          <li>sa spécialité médicale ;</li>
          <li>ses coordonnées professionnelles.</li>
        </ul>
        <p>Masterclass Médical se réserve le droit de suspendre tout compte dont les informations s&apos;avèrent inexactes ou frauduleuses.</p>
        <p>Le Participant est seul responsable de la confidentialité de ses identifiants de connexion.</p>
      </Section>

      <Section title="Article 3 — Nature du service fourni par Masterclass Médical">
        <p>Masterclass Médical fournit exclusivement :</p>
        <ul>
          <li>un <strong>catalogue de recherche</strong> permettant de découvrir les formations proposées par les Formateurs ;</li>
          <li>un <strong>système d&apos;inscription en ligne</strong> permettant de manifester son intention de participer à une formation ;</li>
          <li>un <strong>service de paiement facilité</strong> via Stripe pour le règlement des frais de formation ;</li>
          <li>un <strong>espace documentaire</strong> permettant de consulter les documents générés (convocation, convention de formation, attestation) après signature par le Formateur.</li>
        </ul>
        <p>Masterclass Médical <strong>ne garantit pas</strong> :</p>
        <ul>
          <li>la qualité pédagogique ni le niveau des formations référencées ;</li>
          <li>la conformité des formations aux exigences du DPC ou de tout autre dispositif de financement ;</li>
          <li>la disponibilité permanente de la Plateforme ;</li>
          <li>le bon déroulement de la relation entre le Formateur et le Participant.</li>
        </ul>
      </Section>

      <Section title="Article 4 — Processus d'inscription à une formation">
        <p><strong>Étape 1 — Sélection :</strong> Le Participant sélectionne une formation dans le catalogue et clique sur « S&apos;inscrire ».</p>
        <p><strong>Étape 2 — Confirmation :</strong> L&apos;inscription est enregistrée dans l&apos;espace du Participant en statut « En attente ».</p>
        <p><strong>Étape 3 — Paiement :</strong> Pour les formations payantes, le Participant procède au règlement via Stripe. L&apos;inscription passe en statut « Confirmée » après vérification du paiement.</p>
        <p><strong>Étape 4 — Convention :</strong> Le Formateur signe numériquement la convention individuelle de formation. Le Participant reçoit alors accès au document depuis son espace.</p>
        <p>Masterclass Médical agit en qualité d&apos;intermédiaire technique à chacune de ces étapes. Elle ne valide pas le contenu de la formation ni les compétences du Formateur.</p>
      </Section>

      <Section title="Article 5 — Prix et paiement">
        <p>Les prix des formations sont affichés en euros, hors taxes (HT), tels que fixés librement par les Formateurs. Certaines formations peuvent être exonérées de TVA au titre des formations professionnelles (article 261-4-4° du CGI) ; cette exonération relève de la seule responsabilité du Formateur.</p>
        <p>Le paiement est sécurisé et traité par <strong>Stripe</strong> (Stripe Payments Europe, Ltd.). Masterclass Médical ne collecte ni ne stocke aucune donnée bancaire. En réglant, le Participant accepte également les conditions d&apos;utilisation de Stripe.</p>
        <p>Masterclass Médical perçoit une commission de 20 % sur le montant de chaque transaction, reversée au Formateur à hauteur de 80 %. Cette répartition est transparente et sans incidence sur le prix payé par le Participant.</p>
      </Section>

      <Section title="Article 6 — Annulation et remboursement">
        <p><strong>Annulation par le Participant :</strong> Toute demande d&apos;annulation doit être adressée directement au Formateur. Les conditions de remboursement sont définies par le Formateur dans le cadre de la convention de formation. Masterclass Médical n&apos;est pas responsable du traitement des remboursements.</p>
        <p><strong>Annulation par le Formateur :</strong> En cas d&apos;annulation d&apos;une formation par le Formateur, le Participant sera intégralement remboursé du montant payé. Masterclass Médical facilitera le remboursement via Stripe dans les meilleurs délais.</p>
        <p><strong>Droit de rétractation :</strong> Conformément à l&apos;article L. 6353-5 du Code du travail, lorsque la convention de formation est conclue au moins 10 jours avant le début de la formation, le Participant dispose d&apos;un délai de 10 jours calendaires pour se rétracter. La rétractation doit être notifiée directement au Formateur par écrit.</p>
      </Section>

      <Section title="Article 7 — Relation contractuelle avec le Formateur">
        <p>L&apos;inscription crée une relation contractuelle <strong>directe et exclusive entre le Participant et le Formateur</strong>. Masterclass Médical n&apos;est pas partie à ce contrat et ne peut être tenue responsable de son inexécution.</p>
        <p>En cas de litige avec un Formateur (formation annulée sans remboursement, contenu non conforme à la description, etc.), le Participant doit :</p>
        <ul>
          <li>contacter le Formateur en premier lieu ;</li>
          <li>si aucune solution n&apos;est trouvée, contacter Masterclass Médical à <a href="mailto:contact@masterclass-medical.fr">contact@masterclass-medical.fr</a>, qui facilitera la mise en relation sans pouvoir se substituer au Formateur.</li>
        </ul>
        <p>Masterclass Médical pourra, à sa discrétion, suspendre le compte d&apos;un Formateur dont les manquements répétés seraient avérés, sans que cette mesure ne constitue une reconnaissance de responsabilité de sa part.</p>
      </Section>

      <Section title="Article 8 — Documents accessibles via la Plateforme">
        <p>Après confirmation de l&apos;inscription et signature de la convention par le Formateur, les documents suivants sont accessibles depuis l&apos;espace Participant :</p>
        <ul>
          <li>la convocation à la formation ;</li>
          <li>la convention individuelle de formation (entre le Formateur et le Participant) ;</li>
          <li>après la formation : l&apos;attestation de présence et le certificat de réalisation.</li>
        </ul>
        <p>Ces documents sont générés automatiquement par la Plateforme sur la base des informations fournies par le Formateur. Masterclass Médical ne garantit pas leur recevabilité auprès d&apos;un financeur particulier (OPCO, ANDPC, employeur). Le Participant doit vérifier auprès de son financeur les documents requis avant toute inscription.</p>
      </Section>

      <Section title="Article 9 — Responsabilité du Participant">
        <p>Le Participant est seul responsable :</p>
        <ul>
          <li>de la vérification de l&apos;adéquation de la formation à ses besoins professionnels ;</li>
          <li>de la vérification de l&apos;éligibilité de la formation à tout financement qu&apos;il souhaite mobiliser ;</li>
          <li>de son comportement lors de la formation.</li>
        </ul>
      </Section>

      <Section title="Article 10 — Données personnelles">
        <p>Le traitement des données personnelles du Participant est régi par la <a href="/legal/confidentialite">Politique de confidentialité</a> de la Plateforme.</p>
        <p>Les informations du profil du Participant (nom, spécialité, coordonnées) sont transmises au Formateur pour les seuls besoins de l&apos;organisation de la formation (convention, convocation, attestation).</p>
      </Section>

      <Section title="Article 11 — Médiation de la consommation">
        <p>Conformément aux articles L. 616-1 et R. 616-1 du Code de la consommation, Masterclass Médical propose un dispositif de médiation de la consommation. En cas de litige non résolu, le Participant peut avoir recours à un médiateur de la consommation dont les coordonnées sont disponibles sur demande à <a href="mailto:contact@masterclass-medical.fr">contact@masterclass-medical.fr</a>.</p>
      </Section>

      <Section title="Article 12 — Modifications des CGU">
        <p>Masterclass Médical se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions seront notifiées au Participant par email avec un préavis de 30 jours. L&apos;utilisation de la Plateforme après ce délai vaut acceptation des nouvelles conditions.</p>
      </Section>

      <Section title="Article 13 — Droit applicable et litiges">
        <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher une solution amiable. À défaut, le litige sera soumis aux tribunaux compétents conformément aux règles de droit commun.</p>
        <p>Pour les Participants agissant en qualité de consommateurs (à titre non professionnel), les dispositions impératives du droit de la consommation s&apos;appliquent nonobstant toute clause contraire.</p>
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
