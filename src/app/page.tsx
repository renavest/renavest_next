"use client";
import { signal, effect } from "@preact/signals-react";
import { redirect } from "next/navigation";
import FloatingHeader from "../features/home/components/FloatingHeader";
import GridComponent from "../features/home/components/Grid";
import TherapistList from "../config/therapistsList";
import { Advisor } from "@/src/shared/types";
import { checkUserVerified } from "../features/auth/utils/auth";

const isLoading = signal(true);

export default function Home() {

  effect(() => {
    if (!checkUserVerified()) {
      redirect("/login");
    }
    isLoading.value = false;
  });

  if (isLoading.value) {
    return null;
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <FloatingHeader title="Renavest" />
      <section className="p-6 px-0 mt-16">
        <h2 className="text-3xl mt-10 font-bold text-center">
          Financial Therapists
        </h2>
      </section>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start bg-white">
        <GridComponent advisors={TherapistList as Advisor[]} />
      </main>
    </div>
  );
}
