import type { Testimonial } from "@/modules/testimonials/domain/testimonial";
import type { TestimonialReader } from "@/modules/testimonials/domain/testimonial-ports";

export class ListTestimonials {
  constructor(private readonly reader: TestimonialReader) {}

  execute(): Promise<readonly Testimonial[]> {
    return this.reader.listPublished();
  }
}
