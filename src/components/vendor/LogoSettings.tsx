"use client";
import { assetPath } from "@/lib/utils/paths";
import Image from "next/image";
import { useRef, useState } from "react";
import { CookingPot, Upload, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store/store";
export function LogoSettings() {
  const { state, mutate } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const logo = state.restaurant.logo;
  async function upload(file: File) {
    setMessage("");
    setError("");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 700000
    ) {
      setError("Choose a PNG, JPEG or WebP logo under 700 KB.");
      return;
    }
    setBusy(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("The file could not be read."));
        reader.readAsDataURL(file);
      });
      const preview = new window.Image();
      preview.src = data;
      await preview.decode();
      const ok = await mutate((s) => {
        s.restaurant.logo = data;
      });
      if (ok)
        setMessage(
          "Logo saved. Your customer menu and vendor dashboard are updated.",
        );
    } catch {
      setError(
        "This image could not be opened. Please choose a valid logo image.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <section className="panel">
      <h2>Restaurant / hotel logo</h2>
      <div className="logo-settings">
        <div className="logo-preview">
          {logo ? (
            <Image
              src={assetPath(logo)}
              alt="Current restaurant logo"
              width={96}
              height={96}
              unoptimized
            />
          ) : (
            <CookingPot size={38} />
          )}
        </div>
        <div className="logo-settings-controls">
          <label className="logo-upload-label">
            Upload your logo
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload restaurant or hotel logo"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          <p className="muted">
            PNG, JPEG or WebP, up to 700 KB. Saved automatically. Your logo
            appears in the headers, welcome animation and footer.
          </p>
          <div className="actions">
            <button
              className="button gold small"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Upload size={16} />
              {busy ? "Saving logo..." : logo ? "Replace logo" : "Choose logo"}
            </button>
            {logo && (
              <button
                className="button soft small"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  const ok = await mutate((s) => {
                    s.restaurant.logo = "";
                  });
                  setBusy(false);
                  if (ok)
                    setMessage(
                      "Logo removed. The default restaurant icon is restored.",
                    );
                }}
              >
                <Trash2 size={16} />
                Remove logo
              </button>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="logo-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="muted">
          {message}
        </p>
      )}
    </section>
  );
}
