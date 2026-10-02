import Navbar from "@/components/navbar";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/toast"

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", "dark", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar/>
          {children}
          <Footer/>
          <Toaster/>
        </AuthProvider>
      </body>
    </html>
  );
}
