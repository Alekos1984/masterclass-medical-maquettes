"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useScrollHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useCounterAnimation(ref: React.RefObject<HTMLElement | null>, target: number, started: boolean) {
  useEffect(() => {
    if (!started || !ref.current) return;
    const el = ref.current;
    let val = 0;
    const step = target / 80;
    const t = setInterval(() => {
      val += step;
      if (val >= target) { val = target; clearInterval(t); }
      el.textContent = Math.floor(val).toLocaleString("fr-FR");
    }, 18);
    return () => clearInterval(t);
  }, [started, target, ref]);
}

function StatsBar() {
  const [started, setStarted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const stat1 = useRef<HTMLSpanElement>(null);
  const stat2 = useRef<HTMLSpanElement>(null);
  const stat3 = useRef<HTMLSpanElement>(null);

  useCounterAnimation(stat1, 142, started);
  useCounterAnimation(stat2, 87, started);
  useCounterAnimation(stat3, 1840, started);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="stats-bar" ref={barRef}>
      <div className="stat-item">
        <span className="stat-number" ref={stat1}>—</span>
        <span className="stat-label">Formations organisées</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" ref={stat2}>—</span>
        <span className="stat-label">Médecins formateurs</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" ref={stat3}>—</span>
        <span className="stat-label">Participants certifiés</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">72h</span>
        <span className="stat-label">Devis salle garanti</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const scrolled = useScrollHeader();
  useReveal();

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* HEADER */}
      <header id="header" className={`site-header${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="logo">
          <div className="logo-mark">M</div>
          <div className="logo-text">
            Masterclass Médical
            <span>Formation médicale</span>
          </div>
        </Link>
        <nav>
          <a href="#comment" className="nav-pill" onClick={scrollTo("#comment")}>Comment ça marche</a>
          <Link href="/formations" className="nav-pill">Formations</Link>
          <a href="#formateurs" className="nav-pill" onClick={scrollTo("#formateurs")}>Pour qui</a>
          <Link href="/auth/inscription/formateur" className="nav-cta">Organiser une formation</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot" />
            Bêta ouverte · Première formation gratuite
          </div>
          <h1>
            Organisez votre<br />
            <span className="serif">masterclass médicale</span><br />
            en quelques minutes.
          </h1>
          <p className="hero-sub">
            La première infrastructure d&apos;organisation de formations médicales présentielle.
            De la salle à l&apos;attestation — entièrement automatisé.
          </p>
          <div className="hero-actions">
            <Link href="/auth/inscription/formateur" className="btn-primary">Créer ma première formation →</Link>
            <a href="#comment" className="btn-ghost" onClick={scrollTo("#comment")}>Voir comment ça marche</a>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* STATS */}
      <StatsBar />

      {/* POURQUOI */}
      <section className="section" id="pourquoi">
        <div className="container">
          <div className="features-layout">
            <div>
              <div className="section-eyebrow reveal">Pourquoi Masterclass Médical</div>
              <h2 className="section-title reveal">Organisez. <span className="serif">Formez.</span><br />Sans la paperasse.</h2>
              <p className="section-sub reveal">
                La formation médicale indépendante ne devrait pas nécessiter des semaines de préparation administrative.
                Nous avons automatisé tout le reste.
              </p>
              <div style={{ marginTop: 40 }}>
                <div className="feature-item reveal">
                  <div className="feature-icon">🌍</div>
                  <div className="feature-body">
                    <h3>Liberté géographique totale</h3>
                    <p>Choisissez n&apos;importe quelle ville. Nous contactons l&apos;hôtel et obtenons le devis sous 72h.</p>
                  </div>
                </div>
                <div className="feature-item reveal reveal-d1">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-body">
                    <h3>Génération automatique de tous les documents</h3>
                    <p>Affiches, programme, attestations, feuille d&apos;émargement numérique, conventions — tout généré instantanément.</p>
                  </div>
                </div>
                <div className="feature-item reveal reveal-d2">
                  <div className="feature-icon">⚖️</div>
                  <div className="feature-body">
                    <h3>Conformité réglementaire intégrée</h3>
                    <p>Conventions de formation, déclaration de conflits d&apos;intérêt, émargement électronique horodaté, signature numérique.</p>
                  </div>
                </div>
                <div className="feature-item reveal reveal-d3">
                  <div className="feature-icon">🤖</div>
                  <div className="feature-body">
                    <h3>IA au service de votre contenu pédagogique</h3>
                    <p>Objectifs, programme, résumé scientifique — générés par IA à partir de votre titre et thématique.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="features-visual reveal">
              <div className="visual-label-top">Dashboard formateur</div>
              <div className="vcard">
                <div className="vcard-label">Formation en cours</div>
                <div className="vcard-title">Cardiologie interventionnelle — Lyon</div>
                <div className="vcard-meta">15 nov. 2026 · Marriott Lyon, Salle Rhône</div>
                <div className="vbadge">✓ Publiée</div>
                <div className="vprogress"><div className="vprogress-bar" /></div>
                <div className="vprogress-labels"><span>7 / 10 participants</span><span>3 places restantes</span></div>
              </div>
              <div className="vcard">
                <div className="vcard-label">Documents générés automatiquement</div>
                <div className="vtags">
                  <span className="vtag">✓ Affiche A4</span>
                  <span className="vtag">✓ Programme PDF</span>
                  <span className="vtag">✓ Convention</span>
                  <span className="vtag">✓ Émargement</span>
                  <span className="vtag">✓ Visuel LinkedIn</span>
                  <span className="vtag">✓ Attestations</span>
                </div>
              </div>
              <div className="vcard">
                <div className="vcard-label">Prochaine automatisation</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.78)", marginTop: 4 }}>
                  ⏰ Kit formateur envoyé dans <strong style={{ color: "#ff8a96" }}>7 jours</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section how" id="comment">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div className="section-eyebrow reveal">Processus</div>
            <h2 className="section-title reveal">De l&apos;idée à la <span className="serif">formation réelle</span><br />en 4 étapes.</h2>
            <p className="section-sub reveal" style={{ maxWidth: "100%", textAlign: "center", margin: "0 auto" }}>
              Une fois ces étapes complétées, la plateforme génère tout automatiquement. Zéro tâche administrative supplémentaire.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card reveal">
              <div className="step-num-big">01</div>
              <h3>Créez votre profil formateur</h3>
              <p>Spécialité, expériences, publications. Import depuis LinkedIn ou ResearchGate. Votre carte de visite scientifique.</p>
              <div className="step-pill">5 minutes</div>
            </div>
            <div className="step-card reveal reveal-d1">
              <div className="step-num-big">02</div>
              <h3>Choisissez votre lieu</h3>
              <p>Ville, hôtel ou centre de conférence, capacité. Nous contactons l&apos;établissement et vous envoyons le devis sous 72h.</p>
              <div className="step-pill">⚡ Automatisé</div>
            </div>
            <div className="step-card reveal reveal-d2">
              <div className="step-num-big">03</div>
              <h3>Déposez votre projet</h3>
              <p>Titre, thématique, objectifs, programme. L&apos;IA vous assiste pour structurer votre contenu pédagogique.</p>
              <div className="step-pill">IA intégrée</div>
            </div>
            <div className="step-card reveal reveal-d3">
              <div className="step-num-big">04</div>
              <h3>Validez et c&apos;est lancé</h3>
              <p>Acceptez le devis, payez en ligne. Tous les documents, la landing page et les outils de communication sont générés.</p>
              <div className="step-pill">⚡ Tout généré</div>
            </div>
          </div>
        </div>
      </section>

      {/* POUR QUI */}
      <section className="section" id="formateurs">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 0 }}>
            <div>
              <div className="section-eyebrow reveal">Pour qui</div>
              <h2 className="section-title reveal">
                Pour tous les médecins<br /><span className="serif">qui ont quelque chose à transmettre.</span>
              </h2>
            </div>
            <p className="section-sub reveal" style={{ marginBottom: 4 }}>
              Quelle que soit votre spécialité, si vous avez une expertise à partager, la plateforme est faite pour vous.
            </p>
          </div>
          <div className="audience-grid">
            <Link href="/auth/inscription/formateur" className="audience-card reveal">
              <div className="audience-num">01 — Formateur</div>
              <h3>Le médecin expert</h3>
              <p>Vous avez une expertise reconnue et souhaitez la transmettre à vos pairs dans votre région ou dans toute la France. Créez votre masterclass en toute indépendance.</p>
              <div className="audience-arrow">Je suis formateur →</div>
            </Link>
            <Link href="/formations" className="audience-card reveal reveal-d1">
              <div className="audience-num">02 — Participant</div>
              <h3>Le médecin en formation</h3>
              <p>Vous cherchez des formations pointues, des petits formats premium avec de vrais experts. Trouvez et inscrivez-vous aux masterclasses près de chez vous.</p>
              <div className="audience-arrow">Je cherche une formation →</div>
            </Link>
            <Link href="/auth/inscription/formateur" className="audience-card reveal reveal-d2">
              <div className="audience-num">03 — Multi-intervenants</div>
              <h3>Le mini-symposium</h3>
              <p>Organisez des événements scientifiques collaboratifs. Invitez des co-formateurs, créez un programme multi-sessions, gérez plusieurs intervenants.</p>
              <div className="audience-arrow">Organiser un symposium →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="section testimonials">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
            <div className="section-eyebrow reveal">Témoignages</div>
            <h2 className="section-title reveal">Ce que disent les<br /><span className="serif">médecins formateurs.</span></h2>
          </div>
          <div className="testimonials-grid">
            <div className="tcard reveal">
              <div className="tcard-stars">★★★★★</div>
              <p className="tcard-text">&ldquo;J&apos;ai organisé ma première masterclass en cardiologie sans aucune aide administrative. Programme, affiches, inscriptions — tout était prêt en moins d&apos;une heure.&rdquo;</p>
              <div className="tcard-author">
                <div className="tcard-avatar">PD</div>
                <div>
                  <div className="tcard-name">Dr. Pierre Dumont</div>
                  <div className="tcard-role">Cardiologue · Lyon</div>
                </div>
              </div>
            </div>
            <div className="tcard reveal reveal-d1">
              <div className="tcard-stars">★★★★★</div>
              <p className="tcard-text">&ldquo;L&apos;émargement numérique et les attestations automatiques m&apos;ont convaincue. C&apos;est réglementairement irréprochable et ça m&apos;économise des heures de travail.&rdquo;</p>
              <div className="tcard-author">
                <div className="tcard-avatar">SB</div>
                <div>
                  <div className="tcard-name">Dr. Sophie Bernard</div>
                  <div className="tcard-role">Neurologue · Paris</div>
                </div>
              </div>
            </div>
            <div className="tcard reveal reveal-d2">
              <div className="tcard-stars">★★★★★</div>
              <p className="tcard-text">&ldquo;Organiser une formation à Bordeaux depuis Lille, avec la plateforme qui gère tout — c&apos;est exactement ce dont la formation médicale indépendante avait besoin.&rdquo;</p>
              <div className="tcard-author">
                <div className="tcard-avatar">ML</div>
                <div>
                  <div className="tcard-name">Dr. Marc Lefebvre</div>
                  <div className="tcard-role">Rhumatologue · Lille</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <div className="container">
          <h2>Prêt à organiser votre<br /><span className="serif">première masterclass ?</span></h2>
          <p className="cta-band-desc">La première formation est entièrement gratuite. Aucun abonnement requis pour démarrer.</p>
          <Link href="/auth/inscription/formateur" className="btn-white">Créer ma formation gratuitement →</Link>
          <p className="cta-note">Première formation offerte · Aucune carte bancaire requise</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="footer-logo-mark">M</div>
              Masterclass Médical
            </div>
            <p className="footer-desc">La plateforme d&apos;organisation simplifiée et automatisée de formations médicales présentielle. De l&apos;idée à la certification.</p>
          </div>
          <div className="footer-col">
            <h4>Plateforme</h4>
            <a href="#comment" onClick={scrollTo("#comment")}>Comment ça marche</a>
            <Link href="/formations">Formations disponibles</Link>
            <Link href="/auth/inscription/formateur">Devenir formateur</Link>
            <a href="#">Tarifs</a>
          </div>
          <div className="footer-col">
            <h4>Ressources</h4>
            <a href="#">Guide du formateur</a>
            <a href="#">Documents types</a>
            <a href="#">Réglementation</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:contact@masterclass-medical.fr">Nous contacter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Mentions légales</a>
            <a href="#">CGU</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Masterclass Médical — Tous droits réservés</span>
          <div>
            <a href="#">Confidentialité</a>
            <a href="#">CGU</a>
          </div>
        </div>
      </footer>
    </>
  );
}
