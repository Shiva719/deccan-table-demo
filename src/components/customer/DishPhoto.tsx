"use client";
import { assetPath } from "@/lib/utils/paths";
import Image from "next/image";
import { useState } from "react";
import type { MenuItem } from "@/types";
export function DishPhoto({
  dish,
  priority = false,
}: {
  dish: MenuItem;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className="dish-photo">
      {dish.image && failed !== dish.image ? (
        <Image
          src={assetPath(dish.image)}
          alt={dish.name}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 350px"
          priority={priority}
          unoptimized
          onError={() => setFailed(dish.image)}
        />
      ) : (
        <div className="photo-placeholder">
          <span aria-hidden="true">{dish.emoji || "🍽️"}</span>
          <small>{dish.name}</small>
          <small>Photo to be added</small>
        </div>
      )}
      {dish.tag && <span className="dish-tag">{dish.tag}</span>}
    </div>
  );
}
