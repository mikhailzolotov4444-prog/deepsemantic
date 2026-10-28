import type { Testimonial } from "./testimonial";

export interface TestimonialReader {
  /** Only testimonials that are approved for display. */
  listPublished(): Promise<readonly Testimonial[]>;
}
