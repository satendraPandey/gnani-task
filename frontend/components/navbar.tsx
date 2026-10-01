import { navItems, SITE_NAME } from "@/config";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full sticky top-0 left-0 right-0 px-2 md:px-4 bg-neutral-800/40 backdrop-blur-lg items-center">
      <div className="w-full max-w-300 mx-auto flex justify-between py-2.5">
        <div className="h-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white"></div>
            <h1 className="text-lg">{SITE_NAME}</h1>
        </div>
        <div className="flex gap-6 ">

          <nav className="flex gap-4 items-center ">
            {navItems.map((item, idx) => (
              <Link href={item.url} key={idx} className="text-sm tracking-wide text-white/80 hover:text-white hover:underline underline-offset-2 transition-all duration-200">
                {item.name}
              </Link>
            ))}
          </nav>

          <Link href={'/login'} className="bg-white text-black px-4 py-1 h-8 rounded-2xl hover:bg-blue-500 hover:text-white transition-all duration-150">
                Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
