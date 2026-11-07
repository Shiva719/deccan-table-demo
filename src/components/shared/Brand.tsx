"use client";
import { assetPath } from "@/lib/utils/paths";
import Image from "next/image";
import { useState } from "react";
import { CookingPot } from "lucide-react";
import { useStore } from "@/lib/store/store";
export function Brand() {
  const { state } = useStore();
  const logo = state.restaurant.logo;
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className="brand">
      <span
        className={"brandmark" + (logo && failed !== logo ? " has-logo" : "")}
      >
        {logo && failed !== logo ? (
          <Image
            src={assetPath(logo)}
            alt="Restaurant logo"
            width={96}
            height={96}
            unoptimized
            onError={() => setFailed(logo)}
          />
        ) : (
          <CookingPot size={26} />
        )}
      </span>
      <span>
        <strong>{state.restaurant.name}</strong>
        <small>{state.restaurant.tagline.toUpperCase()}</small>
      </span>
    </div>
  );
}
