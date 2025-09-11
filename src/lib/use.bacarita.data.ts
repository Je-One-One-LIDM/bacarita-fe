"use client";
import { useEffect, useState } from "react";
import { ls, KEYS } from "@/lib/storage";
import { STORY_SEED, CHILDREN_SEED } from "@/lib/seeds";
import type { Story, ChildProgress } from "@/lib/types";

export function useBacaritaData() {
  const [stories, setStories] = useState<Story[]>(() => ls.read(KEYS.stories, STORY_SEED));
  const [children, setChildren] = useState<ChildProgress[]>(() => ls.read(KEYS.children, CHILDREN_SEED));

  useEffect(() => ls.write(KEYS.stories, stories), [stories]);
  useEffect(() => ls.write(KEYS.children, children), [children]);

  return { stories, setStories, children, setChildren } as const;
}
