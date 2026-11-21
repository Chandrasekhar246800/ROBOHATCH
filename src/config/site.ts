export const siteConfig = {
  name: "RoboHatch",
  title: "RoboHatch | Premium 3D-Printed Products",
  description:
    "Discover meticulously engineered and artfully crafted 3D-printed products, built for modern spaces and refined aesthetics.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://robohatch.com",
  ogImage: "https://robohatch.com/og.png",
  links: {
    twitter: "https://twitter.com/robohatch",
    github: "https://github.com/robohatch",
  },
  nav: {
    main: [
      { title: "Catalog", href: "/products" },
      { title: "Categories", href: "/categories" },
      { title: "About", href: "/about" },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
