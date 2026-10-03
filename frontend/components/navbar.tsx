"use client";

import { LogoSvg, navItems, SITE_NAME } from "@/config";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="w-full sticky top-0 left-0 right-0 px-2 md:px-4 bg-background/20 backdrop-blur border-b-2 border-b-border items-center z-40">
      <div className="w-full max-w-300 mx-auto flex justify-between py-2.5 items-center">
        <Link href="/" className="h-8 flex items-center gap-2.5 group">
          <LogoSvg className="h-8 w-8 text-white transition-transform group-hover:scale-105" />
          <h1 className="text-lg font-semibold tracking-tight">{SITE_NAME}</h1>
        </Link>

        <div className="flex gap-6 items-center">
          <nav className="flex gap-4 items-center">
            {navItems.map((item, idx) => (
              <Link
                href={item.url}
                key={idx}
                className="text-sm tracking-wide text-foreground/60 hover:text-foreground hover:underline underline-offset-2 transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                aria-label="User account"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    className="rounded-full object-cover border border-white/10 hover:border-white/30 transition-colors"
                    alt="Profile"
                    width={34}
                    height={34}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white border border-white/10">
                    {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium text-foreground truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button nativeButton={false} render={<Link href="/login" />}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
