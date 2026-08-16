import { Link } from "react-router";

import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ADRESE_EMAIL, DATA_ACTUALIZARE, GITHUB_URL } from "@/content/contact";

/** Termenii descriu site-ul așa cum e acum: gratuit, static, fără conturi. */
export default function Termeni() {
  return (
    <>
      <PageHeader
        titlu="Termeni și condiții"
        descriere="Ce e site-ul acesta, cum poate fi folosit și ce facem când găsim o greșeală."
        breadcrumb={[{ eticheta: "Acasă", to: "/" }, { eticheta: "Termeni și condiții" }]}
      />

      <Container className="pb-16">
        <div className="max-w-3xl">
          <h2 className="text-sectiune font-bold">Ce e site-ul</h2>
          <p className="text-text-slab mt-3">
            Un material de învățat metode numerice: fiecare metodă din curs, cu formula ei, o
            explicație și o interfață cu care te poți juca. E gratuit, nu cere cont și nu vinde
            nimic.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Cum poate fi folosit</h2>
          <p className="text-text-slab mt-3">
            Poți să-l folosești pentru studiu personal, la seminar sau la oră, și poți trimite
            linkuri către orice pagină. Dacă preiei explicații sau figuri într-un material al tău,
            spune de unde vin. Codul e public pe{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent-slab underline underline-offset-4"
            >
              GitHub
            </a>
            ; pentru orice folosire care trece de studiu și citare, întreabă-ne întâi pe e-mail.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Conținutul matematic</h2>
          <p className="text-text-slab mt-3">
            Formulele, notațiile și exemplele vin din cursul predat, nu din alte surse, iar
            exemplele numerice sunt verificate separat, prin calcul, înainte să ajungă pe site.
            Acolo unde cursul însuși are o scăpare, diferența e scrisă pe față, nu corectată tăcut.
          </p>
          <p className="text-text-slab mt-3">
            Cu toate astea, site-ul nu ține locul cursului, al seminarului sau al unei cărți, și nu
            e o unealtă de calcul pentru lucrări care contează. Dacă găsești o greșeală, scrie-ne —
            o reparăm și scriem ce am schimbat.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Disponibilitate</h2>
          <p className="text-text-slab mt-3">
            Site-ul e găzduit pe GitHub Pages și e oferit așa cum e, fără garanția că e mereu
            accesibil. Paginile se pot schimba sau reorganiza.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Datele tale</h2>
          <p className="text-text-slab mt-3">
            Nu îți cerem niciuna. Ce se întâmplă totuși — alegerea temei, ținută în browserul tău,
            și jurnalele gazdei — scrie în{" "}
            <Link to="/confidentialitate" className="text-accent-slab underline underline-offset-4">
              politica de confidențialitate
            </Link>
            .
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Cine răspunde</h2>
          <p className="text-text-slab mt-3">
            Site-ul e ținut de două persoane particulare, nu de o firmă. Ne găsești la{" "}
            {ADRESE_EMAIL.map(({ email }, i) => (
              <span key={email}>
                {i > 0 && ", "}
                <a
                  href={`mailto:${email}`}
                  className="text-accent-slab font-mono underline underline-offset-4"
                >
                  {email}
                </a>
              </span>
            ))}
            .
          </p>

          <p className="text-text-slab mt-10 text-sm">Ultima actualizare: {DATA_ACTUALIZARE}.</p>
        </div>
      </Container>
    </>
  );
}
