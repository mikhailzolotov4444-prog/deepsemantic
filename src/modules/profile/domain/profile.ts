export interface Certification {
  readonly name: string;
  readonly issuer: string;
  readonly year?: number;
}

export interface Experience {
  readonly role: string;
  readonly place: string;
  readonly period: string;
  readonly summary: string;
}

export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

export interface ProfilePhoto {
  /** Path inside /public, e.g. "/images/teacher.jpg". */
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface Profile {
  readonly displayName: string;
  readonly headline: string;
  /** One string per paragraph. */
  readonly bio: readonly string[];
  readonly photo?: ProfilePhoto;
  readonly certifications: readonly Certification[];
  readonly experience: readonly Experience[];
  readonly socialLinks: readonly SocialLink[];
}
