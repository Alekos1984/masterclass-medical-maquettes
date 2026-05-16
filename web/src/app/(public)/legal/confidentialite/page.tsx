export const metadata = { title: "Politique de confidentialité — Masterclass Médical" };

export default function ConfidentialitePage() {
  return (
    <>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>Politique de confidentialité</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée</p>

      <Section title="1. Identité du responsable de traitement">
        <p>Le responsable du traitement des données à caractère personnel collectées via la plateforme Masterclass Médical est :</p>
        <ul>
          <li><strong>Raison sociale :</strong> [Raison sociale de la société éditrice]</li>
          <li><strong>Adresse :</strong> [Adresse complète du siège social]</li>
          <li><strong>Contact RGPD :</strong> <a href="mailto:privacy@masterclass-medical.fr">privacy@masterclass-medical.fr</a></li>
        </ul>
      </Section>

      <Section title="2. Données collectées">
        <p><strong>2.1 — Données fournies lors de l&apos;inscription (tous utilisateurs) :</strong></p>
        <ul>
          <li>Adresse e-mail</li>
          <li>Mot de passe (stocké sous forme hachée, non réversible)</li>
          <li>Rôle choisi (Formateur ou Participant)</li>
        </ul>

        <p><strong>2.2 — Données du profil Formateur :</strong></p>
        <ul>
          <li>Nom et prénom, titre professionnel, spécialité</li>
          <li>Numéro RPPS</li>
          <li>SIRET et raison sociale de la structure</li>
          <li>Numéro de téléphone professionnel</li>
          <li>Informations Stripe Connect (gérées directement par Stripe)</li>
        </ul>

        <p><strong>2.3 — Données du profil Participant :</strong></p>
        <ul>
          <li>Nom et prénom, titre professionnel, spécialité</li>
          <li>Numéro de téléphone professionnel</li>
          <li>Adresse professionnelle</li>
        </ul>

        <p><strong>2.4 — Données générées par l&apos;utilisation du service :</strong></p>
        <ul>
          <li>Inscriptions à des formations (formation, date, statut, montant)</li>
          <li>Documents générés (convocations, conventions, attestations)</li>
          <li>Logs de connexion (adresse IP, horodatage)</li>
          <li>Identifiant de session Stripe pour le suivi des paiements</li>
        </ul>

        <p><strong>2.5 — Données non collectées :</strong> Masterclass Médical ne collecte ni ne stocke aucune donnée bancaire. Le traitement des paiements est intégralement délégué à Stripe, soumis à sa propre politique de confidentialité.</p>
      </Section>

      <Section title="3. Finalités et bases légales des traitements">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #ddd" }}>Finalité</th>
              <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #ddd" }}>Base légale</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Création et gestion du compte utilisateur", "Exécution du contrat (CGU)"],
              ["Référencement des formations dans le catalogue", "Exécution du contrat"],
              ["Gestion des inscriptions et paiements", "Exécution du contrat"],
              ["Génération des documents réglementaires", "Obligation légale / exécution du contrat"],
              ["Transmission des données Participant au Formateur", "Exécution du contrat"],
              ["Logs de sécurité et de connexion", "Intérêt légitime (sécurité du service)"],
              ["Envoi d'emails transactionnels (confirmation, convocation)", "Exécution du contrat"],
              ["Amélioration de la plateforme (statistiques anonymisées)", "Intérêt légitime"],
            ].map(([f, b]) => (
              <tr key={f}>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{f}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. Destinataires des données">
        <p>Les données personnelles des utilisateurs sont accessibles aux catégories de destinataires suivants :</p>
        <ul>
          <li><strong>L&apos;équipe interne de Masterclass Médical</strong> : pour la gestion du service et le support.</li>
          <li><strong>Le Formateur</strong> : reçoit les données du profil des Participants inscrits à ses formations (nom, prénom, titre, spécialité, téléphone, adresse) pour les seuls besoins de l&apos;organisation de la formation et de la génération des documents réglementaires.</li>
          <li><strong>Stripe</strong> : traitement des paiements (données de transaction uniquement, conformément à la politique de Stripe).</li>
          <li><strong>Scalingo</strong> : hébergeur de la plateforme (données stockées en France).</li>
          <li><strong>Autorités compétentes</strong> : en cas d&apos;obligation légale.</li>
        </ul>
        <p>Masterclass Médical ne vend, ne loue et ne cède aucune donnée personnelle à des tiers à des fins commerciales.</p>
      </Section>

      <Section title="5. Transferts hors Union européenne">
        <p>Stripe Inc. est une société américaine. Les paiements impliquent un transfert de données vers les États-Unis, encadré par les clauses contractuelles types de la Commission européenne adoptées par Stripe. Aucun autre transfert hors UE n&apos;est effectué.</p>
      </Section>

      <Section title="6. Durée de conservation">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #ddd" }}>Catégorie de données</th>
              <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #ddd" }}>Durée de conservation</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Données de compte actif", "Jusqu'à clôture du compte + 3 ans"],
              ["Données contractuelles (inscriptions, conventions)", "10 ans (prescription décennale)"],
              ["Documents de formation (attestations, certificats)", "10 ans"],
              ["Logs de connexion et de sécurité", "1 an"],
              ["Données de facturation", "10 ans (obligations comptables)"],
            ].map(([c, d]) => (
              <tr key={c}>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{c}</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="7. Droits des personnes concernées">
        <p>Conformément au RGPD, tout utilisateur dispose des droits suivants sur ses données :</p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> (art. 15) : obtenir une copie des données vous concernant.</li>
          <li><strong>Droit de rectification</strong> (art. 16) : corriger des données inexactes.</li>
          <li><strong>Droit à l&apos;effacement</strong> (art. 17) : demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
          <li><strong>Droit à la limitation du traitement</strong> (art. 18) : limiter l&apos;utilisation de vos données dans certains cas.</li>
          <li><strong>Droit à la portabilité</strong> (art. 20) : recevoir vos données dans un format structuré et lisible par machine.</li>
          <li><strong>Droit d&apos;opposition</strong> (art. 21) : s&apos;opposer à certains traitements fondés sur l&apos;intérêt légitime.</li>
        </ul>
        <p>Pour exercer ces droits, adressez votre demande à : <a href="mailto:privacy@masterclass-medical.fr">privacy@masterclass-medical.fr</a></p>
        <p>Vous disposez également du droit d&apos;introduire une réclamation auprès de la Commission Nationale de l&apos;Informatique et des Libertés (CNIL), 3 place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07, <a href="https://www.cnil.fr">www.cnil.fr</a>.</p>
      </Section>

      <Section title="8. Sécurité des données">
        <p>Masterclass Médical met en œuvre les mesures techniques et organisationnelles suivantes pour protéger les données :</p>
        <ul>
          <li>Chiffrement des communications via HTTPS (TLS 1.2+) ;</li>
          <li>Mots de passe hachés (bcrypt) ;</li>
          <li>Documents PDF chiffrés (RC4-128 bits) et scellés (HMAC-SHA256) ;</li>
          <li>Accès aux données restreint aux seuls personnels autorisés ;</li>
          <li>Sessions sécurisées (JWT, cookies httpOnly) ;</li>
          <li>Infrastructure hébergée en France (Scalingo).</li>
        </ul>
      </Section>

      <Section title="9. Cookies">
        <p>La plateforme utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
        <ul>
          <li><strong>Cookie de session d&apos;authentification</strong> : conserve l&apos;état de connexion de l&apos;utilisateur. Durée : session navigateur. Aucun consentement requis (cookie fonctionnel indispensable).</li>
        </ul>
        <p>Aucun cookie publicitaire, de suivi ou d&apos;analyse tiers n&apos;est déposé.</p>
      </Section>

      <Section title="10. Modifications de la présente politique">
        <p>Masterclass Médical se réserve le droit de modifier la présente politique de confidentialité pour l&apos;adapter aux évolutions légales, réglementaires ou techniques. Les utilisateurs seront informés de toute modification significative par email. La date de mise à jour figure en bas de page.</p>
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
