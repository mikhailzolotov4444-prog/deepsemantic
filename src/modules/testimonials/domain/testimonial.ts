export interface Testimonial {
  readonly id: string;
  readonly authorName: string;
  /** For example "Student, B2" or "Parent of a 10-year-old". */
  readonly role?: string;
  readonly quote: string;
}
