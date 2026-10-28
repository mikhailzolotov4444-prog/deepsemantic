import { ImageResponse } from "next/og";
import { siteConfig } from "@/shared/config/site";

// Picture shown when a link to the site is shared in messengers and social networks.
// Only the site name, so the same image fits both language versions.
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3b3fb8",
        color: "#ffffff",
        fontSize: 112,
        fontWeight: 700,
      }}
    >
      {siteConfig.name}
    </div>,
    size,
  );
}
