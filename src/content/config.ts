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

const restaurants = defineCollection({
  // same reasoning as newsDigests above: base lives outside src/content so
  // each restaurant can be authored/edited as its own markdown file.
  loader: glob({ pattern: "**/*.md", base: "./src/data/restaurants" }),
  schema: z.object({
    name: z.string(),
    type: z.enum(["restaurant", "beauty", "grocery"]).default("restaurant"),
    country: z.string(),
    region: z.string(),
    area: z.string(),
    category: z.string(),
    description: z.string(),
    mapQuery: z.string(),
    claimed: z.boolean().default(false),
    logo: z.string().optional(),
    flag: z.string().optional(),
    officialName: z.string().optional(),
    intro: z.string().optional(),
    tables: z.string().optional(),
    signatureDishes: z.array(z.string()).default([]),
    photos: z.array(z.string()).default([]),
    hours: z.string().optional(),
    closedDays: z.string().optional(),
    phone: z.string().optional(),
    reservation: z.string().optional(),
    priceRange: z.string().optional(),
    dietary: z.string().optional(),
    languages: z.string().optional(),
    payment: z.array(z.string()).default([]),
    website: z.string().optional(),
    instagram: z.string().optional(),
    line: z.string().optional(),
    x: z.string().optional(),
    facebook: z.string().optional(),
    tabelog: z.string().optional()
  })
});

export const collections = { newsDigests, restaurants };
