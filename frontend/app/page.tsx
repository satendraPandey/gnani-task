"use client"
import Hero from "@/components/home/hero";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {

  const {data:session, status} = useSession();

  console.log(session, status)

  return (
    <main>
      {/* Hero */}
      <Hero/>

      {/* How to Use */}

      {/* Architecture Summary */}
    </main>
  );
}
