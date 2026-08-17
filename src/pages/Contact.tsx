import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ADRESE_EMAIL, FACULTATE, GITHUB_URL } from "@/content/contact";

export default function Contact() {
  return (
    <>
      <PageHeader
        titlu="Contact"
        descriere="Scrie-ne dacă ai găsit o greșeală, dacă ceva nu se înțelege sau dacă vrei să propui o metodă."
        breadcrumb={[{ eticheta: "Acasă", to: "/" }, { eticheta: "Contact" }]}
      />

      <Container className="pb-16">
        <div className="max-w-3xl">
          <h2 className="text-sectiune font-bold">Cine ține site-ul</h2>
          <p className="text-text-slab mt-3">
            Robert Dimitrescu și Șerban Ciumacencu, studenți la {FACULTATE}.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Pe e-mail</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {ADRESE_EMAIL.map(({ nume, email }) => (
              <li key={email} className="text-text-slab">
                {nume} —{" "}
                <a
                  href={`mailto:${email}`}
                  className="text-accent-slab font-mono underline underline-offset-4"
                >
                  {email}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="text-sectiune mt-10 font-bold">Codul sursă</h2>
          <p className="text-text-slab mt-3">
            Site-ul e public pe GitHub. Acolo se pot deschide și probleme („issues"), dacă îți e mai
            la îndemână decât e-mailul:{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent-slab underline underline-offset-4"
            >
              SerbaC6/numerical-methods-visualizer
            </a>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
