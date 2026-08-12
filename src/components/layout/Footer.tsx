import { Container } from "@/components/layout/Container";

const AN = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-bordura mt-20 border-t py-10">
      <Container className="text-text-slab flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {AN} · Vizualizator de metode numerice · construit cu React și Manim</p>
        <p>
          Conținutul urmează cursul predat. Site static, fără conturi, fără cookies, fără urmărire.
        </p>
      </Container>
    </footer>
  );
}
