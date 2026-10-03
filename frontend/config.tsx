import React from "react";

export const SITE_NAME = "VoiceNote";

export const LogoSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    {...props}
  >
    <rect
      width="32"
      height="32"
      rx="9"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeOpacity="0.2"
      strokeWidth="1.2"
    />
    <path
      d="M9.5 10.5L16 22.5L22.5 10.5"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GithubSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const navItems = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Architecture",
    url: "/architecture",
  },
];

export const socialLinks = [
  {
    label: "Github",
    href: "https://github.com/satendraPandey/gnani-task",
    icon: GithubSvg,
  },
];

export const mainLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Architecture", href: "/architecture" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export const copyright = {
  text: `© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`,
};

export const ALLOWED_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
export const ACCEPTED_FORMATS =
  ".mp3,.wav,.ogg,.flac,.aac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,audio/x-m4a,audio/mp4";