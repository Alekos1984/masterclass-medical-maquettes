export const metadata = { title: "Mentions légales — Masterclass Médical" };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>Mentions légales</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN)</p>

      <Section title="1. Éditeur de la plateforme">
        <p>La plateforme <strong>Masterclass Médical</strong> est éditée par :</p>
        <ul>
          <li><strong>Dénomination sociale :</strong> [Raison sociale de la société éditrice]</li>
          <li><strong>Forme juridique :</strong> [SAS / SARL / autre]</li>
          <li><strong>Capital social :</strong> [Montant] €</li>
          <li><strong>Siège social :</strong> [Adresse complète]</li>
          <li><strong>SIRET :</strong> [Numéro SIRET]</li>
          <li><strong>RCS :</strong> [Tribunal de commerce et numéro]</li>
          <li><strong>Numéro de TVA intracommunautaire :</strong> [Numéro TVA]</li>
          <li><strong>Directeur de la publication :</strong> [Nom et prénom]</li>
          <li><strong>Contact :</strong> <a href="mailto:contact@masterclass-medical.fr">contact@masterclass-medical.fr</a></li>
        </ul>
      </Section>

      <Section title="2. Hébergement">
        <p>La plateforme est hébergée par :</p>
        <ul>
          <li><strong>Hébergeur :</strong> Scalingo SAS</li>
          <li><strong>Adresse :</strong> 15 avenue du Rhin, 67100 Strasbourg, France</li>
          <li><strong>Site web :</strong> scalingo.com</li>
        </ul>
      </Section>

      <Section title="3. Nature de la plateforme">
        <p>Masterclass Médical est une <strong>plateforme numérique d&apos;intermédiation</strong> au sens de l&apos;article L. 111-7 du Code de la consommation.</p>
        <p>Elle met en relation des professionnels de santé proposant des formations continues (ci-après « Formateurs ») avec d&apos;autres professionnels de santé souhaitant y participer (ci-après « Participants »).</p>
        <p><strong>Masterclass Médical n&apos;est pas un organisme de formation.</strong> Elle ne dispense aucune formation et n&apos;est pas partie au contrat de formation professionnelle conclu entre le Formateur et le Participant. Elle agit exclusivement en qualité d&apos;intermédiaire technique fournissant des outils numériques (catalogue, gestion documentaire, traitement des paiements via Stripe).</p>
      </Section>

      <Section title="4. Propriété intellectuelle">
        <p>L&apos;ensemble des éléments constitutifs de la plateforme (charte graphique, textes, logiciels, algorithmes, base de données) est la propriété exclusive de l&apos;éditeur et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
        <p>Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie de la plateforme est strictement interdite et constitue une contrefaçon sanctionnée par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.</p>
        <p>Les contenus pédagogiques publiés par les Formateurs (programmes, descriptions, documents) restent la propriété intellectuelle de leurs auteurs. En les publiant sur la plateforme, le Formateur concède à Masterclass Médical une licence non exclusive d&apos;affichage à titre gratuit pour les seuls besoins du service.</p>
      </Section>

      <Section title="5. Données personnelles">
        <p>Le traitement des données à caractère personnel des utilisateurs est décrit dans la <a href="/legal/confidentialite">Politique de confidentialité</a> de la plateforme, conformément au Règlement Général sur la Protection des Données (RGPD) n° 2016/679 et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.</p>
        <p>Responsable du traitement : [Raison sociale], [adresse], [email DPO ou contact RGPD].</p>
      </Section>

      <Section title="6. Cookies">
        <p>La plateforme utilise des cookies strictement nécessaires à son fonctionnement (session d&apos;authentification). Aucun cookie publicitaire ou de profilage n&apos;est déposé sans consentement préalable de l&apos;utilisateur.</p>
      </Section>

      <Section title="7. Responsabilité">
        <p>Masterclass Médical s&apos;efforce de maintenir la plateforme accessible et à jour. Elle ne saurait être tenue responsable :</p>
        <ul>
          <li>du contenu des formations publiées par les Formateurs, de leur exactitude, de leur qualité pédagogique ou de leur conformité aux obligations de DPC ;</li>
          <li>des engagements pris entre Formateurs et Participants dans le cadre du contrat de formation ;</li>
          <li>des interruptions temporaires de service pour maintenance ou cas de force majeure.</li>
        </ul>
      </Section>

      <Section title="8. Droit applicable et juridiction">
        <p>Les présentes mentions légales sont soumises au droit français. Tout litige relatif à l&apos;édition ou à l&apos;accès à la plateforme relève de la compétence exclusive des tribunaux du ressort du siège social de l&apos;éditeur, sous réserve des dispositions impératives du droit de la consommation.</p>
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
