import { VideoIncorporat } from "@/components/viz/VideoIncorporat";
import miniatura from "@/assets/fft/miniatura.webp";

/**
 * Pagina 14 — secțiunea „Vizual".
 *
 * Singura pagină din site pe care clipul narativ nu e desenat în cod. Motivul e
 * la fel de simplu ca la celelalte excepții: ce trebuie arătat aici — planul
 * complex și recombinarea nivel cu nivel — cere o piesă de desen pe care n-o
 * folosește nicio altă pagină, iar clipul de mai jos spune deja povestea.
 *
 * Fiind găzduit de altcineva, se încarcă doar la cerere; cum, scrie în
 * `VideoIncorporat`.
 */
export function VideoFft() {
  return (
    <VideoIncorporat
      id="htCj9exbGo0"
      titlu="The FFT Algorithm - Simple Step by Step"
      autor="Simon Xu"
      miniatura={miniatura}
      descriere={
        "Clip: transformata Fourier rapidă, pas cu pas. Se pornește de la suma care dă " +
        "coeficienții și se arată cum despărțirea termenilor de indice par de cei de indice " +
        "impar înjumătățește lungimea sumelor la fiecare nivel, până când numărul de operații " +
        "scade de la pătratic la m·log₂m."
      }
    />
  );
}
