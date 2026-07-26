import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const newsDigests = defineCollection({
  // base lives outside src/content — Astro reserves src/content for the
  // legacy collections API and refuses glob loaders pointed inside it.
  loader: glob({ pattern: "**/*.md", base: "./src/data/news-digests" }),
  schema: z.object({
    date: z.string(),
    tag: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    title: z.string(),
    teaser: z.string(),
    sources: z.string(),
    sections: z.array(
      z.object({
        h: z.string(),
        p: z.array(z.string())
      })
    )
  })
});

export const collections = { newsDigests };
