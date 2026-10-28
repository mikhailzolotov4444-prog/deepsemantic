import type { Testimonial } from "@/modules/testimonials/domain/testimonial";
import type { TestimonialReader } from "@/modules/testimonials/domain/testimonial-ports";

/**
 * Empty on purpose: testimonials must come from real students or parents who agreed to be quoted.
 * Add them here (or, from Phase 2, in the admin area). The Home page shows the section only
 * when at least one exists.
 */
export const publishedTestimonials: readonly Testimonial[] = [];

export class StaticTestimonialReader implements TestimonialReader {
  constructor(private readonly testimonials: readonly Testimonial[] = publishedTestimonials) {}

  async listPublished(): Promise<readonly Testimonial[]> {
    return this.testimonials;
  }
}
