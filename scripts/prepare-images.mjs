import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
const menu = JSON.parse(await readFile("src/lib/data/menu.json", "utf8"));
const credits = JSON.parse(
  await readFile("public/images/dishes/credits.json", "utf8"),
);
let bytes = 0;
for (const dish of menu) {
  const credit = credits.find((c) => c.id === dish.id);
  if (!credit || !credit.source || !credit.license || !credit.artist)
    throw Error("Missing attribution for " + dish.id);
  const output = "public/images/dishes/" + dish.id + ".webp";
  await sharp("public/images/dishes/" + dish.id + ".jpg")
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(output);
  const meta = await sharp(output).metadata();
  if (!meta.width || meta.width < 100) throw Error("Invalid photo " + dish.id);
  bytes += (await stat(output)).size;
  dish.image = "/images/dishes/" + dish.id + ".webp";
  credit.file = dish.id + ".webp";
  credit.verified = true;
  credit.modifications =
    "Resized, compressed to WebP, displayed with a cover crop. Illustrative dish photograph; plating may vary.";
}
menu.find((d) => d.id === "alfredo").description =
  "Pasta in a creamy garlic and parmesan-style sauce.";
await writeFile("src/lib/data/menu.json", JSON.stringify(menu, null, 2));
await writeFile(
  "public/images/dishes/credits.json",
  JSON.stringify(credits, null, 2),
);
console.log(
  JSON.stringify({
    verified: menu.length,
    optimizedBytes: bytes,
    placeholders: menu.filter((m) => !m.image).length,
  }),
);
