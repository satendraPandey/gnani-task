import {
  SITE_NAME,
  LogoSvg,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
} from "@/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24 border-t border-white/5">
      <div className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="md:flex md:items-start md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-x-2.5 group"
            aria-label={SITE_NAME}
          >
            <LogoSvg className="h-7 w-7 text-white transition-transform group-hover:scale-105" />
            <span className="font-bold text-xl tracking-tight">{SITE_NAME}</span>
          </Link>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3 items-center">
            {socialLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <li key={i}>
                  <Link
                    href={link.href}
                    target="_blank"
                    aria-label={link.label}
                    className="text-neutral-400 hover:text-white transition-colors p-1.5 flex items-center justify-center rounded-lg hover:bg-white/5"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t border-white/10 mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 underline-offset-4 hover:underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 underline-offset-4 hover:underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-neutral-400 whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div>{copyright.text}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
