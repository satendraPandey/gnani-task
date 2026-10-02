"use client";
import { navItems, SITE_NAME } from "@/config";
import Link from "next/link";
import { Button } from "./ui/button";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="w-full sticky top-0 left-0 right-0 px-2 md:px-4 bg-background/20 backdrop-blur border-b-2 border-b-border items-center">
      <div className="w-full max-w-300 mx-auto flex justify-between py-2.5">
        <div className="h-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white"></div>
          <h1 className="text-lg">{SITE_NAME}</h1>
        </div>
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
            <div className="flex items-center gap-3">
              {session?.user?.image && <Image src={session.user.image} className="rounded-full object-cover" alt="Profile" width={32} height={32}/>}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
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
