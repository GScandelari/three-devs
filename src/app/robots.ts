import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

// Portal, painel e telas de senha não devem aparecer em buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/portal/",
        "/login/",
        "/forgot-password/",
        "/reset-password/",
        "/change-password/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
