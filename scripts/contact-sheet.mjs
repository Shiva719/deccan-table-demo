import sharp from "sharp";
import { readdir } from "node:fs/promises";
const names = (await readdir("public/images/dishes")).filter((n) =>
  n.endsWith(".jpg"),
);
const tiles = [];
for (let i = 0; i < names.length; i++) {
  const photo = await sharp("public/images/dishes/" + names[i])
    .resize(210, 145, { fit: "cover" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="210" height="25"><rect width="210" height="25" fill="white"/><text x="8" y="17" font-size="13">${names[i]}</text></svg>`,
  );
  tiles.push(
    { input: photo, top: Math.floor(i / 5) * 175, left: (i % 5) * 210 },
    { input: label, top: Math.floor(i / 5) * 175 + 145, left: (i % 5) * 210 },
  );
}
await sharp({
  create: {
    width: 1050,
    height: Math.ceil(names.length / 5) * 175,
    channels: 3,
    background: "#eee",
  },
})
  .composite(tiles)
  .jpeg()
  .toFile("public/images/contact-sheet.jpg");
console.log(names);
