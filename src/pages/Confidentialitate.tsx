import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ADRESE_EMAIL, DATA_ACTUALIZARE } from "@/content/contact";

/**
 * Politica de confidențialitate descrie site-ul **așa cum e acum**: static, fără
 * conturi, fără cookies, fără cereri către alte domenii. Dacă vreodată apare
 * ceva care culege date (analytics, formular, font de la CDN), textul de aici se
 * schimbă în același commit — altfel devine o promisiune falsă.
 */
export default function Confidentialitate() {
  return (
    <>
      <PageHeader
        titlu="Politica de confidențialitate"
        descriere="Pe scurt: site-ul nu culege date despre tine. Mai jos scrie exact ce se întâmplă totuși."
        breadcrumb={[{ eticheta: "Acasă", to: "/" }, { eticheta: "Confidențialitate" }]}
      />

      <Container className="pb-16">
        <div className="max-w-3xl">
          <h2 className="text-sectiune font-bold">Ce nu facem</h2>
          <p className="text-text-slab mt-3">
            Site-ul e complet static. Nu are conturi și nu cere autentificare, nu folosește cookies,
            nu are analytics și nu urmărește vizitatorii. Nu vindem și nu transmitem date nimănui,
            fiindcă nu avem ce transmite. Nu există publicitate și nu există profilare.
          </p>
          <p className="text-text-slab mt-3">
            Paginile nu cer nimic de la alte domenii: fonturile, imaginile și clipurile sunt
            găzduite chiar de site. Adică browserul tău nu anunță pe nimeni că ești aici.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Ce se salvează în browserul tău</h2>
          <p className="text-text-slab mt-3">
            Un singur lucru: alegerea temei (luminoasă sau întunecată), sub cheia{" "}
            <code className="font-mono">mn-tema</code>, în <em>localStorage</em>. Nu e cookie, nu
            pleacă niciodată de pe dispozitivul tău și nu ne spune nouă nimic — există doar ca
            site-ul să arate la fel data viitoare. Se șterge din setările browserului, la „date ale
            site-ului".
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Găzduirea</h2>
          <p className="text-text-slab mt-3">
            Site-ul e găzduit pe GitHub Pages. Ca orice gazdă web, GitHub poate înregistra în
            jurnalele sale tehnice cererile către server — adresa IP și tipul de browser — pentru
            funcționare și securitate. Acele jurnale sunt ale GitHub, nu ale noastre: nu avem acces
            la ele și nu le putem citi. Ce face GitHub cu ele scrie în declarația lor de
            confidențialitate.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Dacă ne scrii</h2>
          <p className="text-text-slab mt-3">
            Când trimiți un e-mail, primim adresa ta și ce ai scris în mesaj. Le folosim doar ca
            să-ți răspundem și rămân în căsuțele noastre de e-mail; nu ajung într-o listă și nu le
            folosim pentru altceva. Dacă vrei să ștergem un schimb de mesaje, cere-ne-o la aceleași
            adrese:{" "}
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

          <h2 className="text-sectiune mt-10 font-bold">Drepturile tale</h2>
          <p className="text-text-slab mt-3">
            Regulamentul european (GDPR) îți dă dreptul să afli ce date personale are cineva despre
            tine, să ceri corectarea sau ștergerea lor și să te plângi autorității de supraveghere.
            La noi asta se rezumă la mesajele pe care ni le-ai trimis tu — altceva nu deținem.
            Scrie-ne la adresele de mai sus.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Copii</h2>
          <p className="text-text-slab mt-3">
            Site-ul nu culege date de la nimeni, deci nici de la copii. Poate fi folosit la orice
            vârstă.
          </p>

          <h2 className="text-sectiune mt-10 font-bold">Modificări</h2>
          <p className="text-text-slab mt-3">
            Dacă textul de aici se schimbă, se schimbă și data de mai jos. Istoricul complet al
            modificărilor e public, în depozitul de pe GitHub.
          </p>

          <p className="text-text-slab mt-10 text-sm">Ultima actualizare: {DATA_ACTUALIZARE}.</p>
        </div>
      </Container>
    </>
  );
}
