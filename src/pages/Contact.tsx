import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { FACULTATE, GITHUB_URL, PERSOANE } from "@/content/contact";

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
            {PERSOANE[0].nume} și {PERSOANE[1].nume}, studenți la {FACULTATE}.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Pe e-mail</h2>
          <ul className="mt-3 flex flex-col gap-6">
            {PERSOANE.map(({ nume, emailPersonal, emailFacultate }) => (
              <li key={nume} className="text-text-slab">
                <p className="text-text font-semibold">{nume}</p>
                <p className="mt-1">
                  Personal —{" "}
                  <a
                    href={`mailto:${emailPersonal}`}
                    className="text-accent-slab font-mono underline underline-offset-4"
                  >
                    {emailPersonal}
                  </a>
                </p>
                <p className="mt-1">
                  Facultate —{" "}
                  <a
                    href={`mailto:${emailFacultate}`}
                    className="text-accent-slab font-mono underline underline-offset-4"
                  >
                    {emailFacultate}
                  </a>
                </p>
              </li>
            ))}
          </ul>

          <h2 className="text-sectiune mt-10 font-bold">Codul sursă</h2>
          <p className="text-text-slab mt-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent-slab underline underline-offset-4"
            >
              {GITHUB_URL}
            </a>
          </p>
        </div>
      </Container>
    </>
  );
}
