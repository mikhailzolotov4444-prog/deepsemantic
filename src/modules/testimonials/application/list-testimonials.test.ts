import { describe, expect, it } from "vitest";
import type { Testimonial } from "@/modules/testimonials/domain/testimonial";
import { ListTestimonials } from "./list-testimonials";

describe("ListTestimonials", () => {
  it("returns the published testimonials", async () => {
    const published: Testimonial[] = [
      { id: "t-1", authorName: "A. Student", role: "B2 learner", quote: "Great lessons." },
    ];
    const useCase = new ListTestimonials({ listPublished: async () => published });
    expect(await useCase.execute()).toEqual(published);
  });

  it("returns an empty list when there are none", async () => {
    const useCase = new ListTestimonials({ listPublished: async () => [] });
    expect(await useCase.execute()).toEqual([]);
  });
});
