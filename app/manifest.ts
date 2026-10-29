import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Velianos",
    short_name: "Velianos",
    description: "Votre assistante IA pour ne plus rater un seul chantier",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F4F6FC",
    theme_color: "#F4F6FC",
    orientation: "portrait",
    scope: "/",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
