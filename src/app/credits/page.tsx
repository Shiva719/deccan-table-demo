import Link from "next/link";
import credits from "../../../public/images/dishes/credits.json";
import menu from "@/lib/data/menu.json";
function plain(s: string) {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .trim();
}
export default function Credits() {
  return (
    <main className="credits-main">
      <Link className="back-link" href="/menu">
        ← Back to menu
      </Link>
      <p className="eyebrow">WITH THANKS TO THE PHOTOGRAPHERS</p>
      <h1>A little credit, where it’s due.</h1>
      <p>
        Locally stored, licensed Wikimedia Commons photographs. These are
        illustrative photographs of the dishes, rather than photographs of this
        demo restaurant’s own food. Recipes and plating may vary.
      </p>
      <p className="muted">
        Assets were resized, compressed to WebP and displayed with a cover crop.
        Each photograph retains its individual Creative Commons license; follow
        its source link for the original file and full licensing history.
      </p>
      {credits.map((c) => (
        <article className="credit-row" key={c.id}>
          <h3>{menu.find((m) => m.id === c.id)?.name}</h3>
          <p>
            {plain(c.artist)} ·{" "}
            <a href={c.licenseUrl || c.source} target="_blank" rel="noreferrer">
              {c.license}
            </a>
          </p>
          <p>
            <a href={c.source} target="_blank" rel="noreferrer">
              Original photograph and attribution
            </a>{" "}
            · {c.modifications}
          </p>
        </article>
      ))}
    </main>
  );
}
