import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // ADR fields (decisions/)
        status: z.enum(["proposed", "accepted", "superseded"]).optional(),
        date: z.coerce.date().optional(),
        supersedes: z.string().nullable().optional(),
        superseded_by: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        // Component page fields (components/, from Phase 5 on)
        componentStatus: z
          .enum(["planned", "designed", "built", "mapped", "documented"])
          .optional(),
        figmaNode: z.string().optional(),
        since: z.string().optional(),
      }),
    }),
  }),
};
