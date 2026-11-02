import type { Metadata } from "next";
import PartnersGrid from "@/components/PartnersGrid";
import { client } from "@/sanity/lib/client";
import { partnersQuery, type Partner } from "@/sanity/queries/partners";

export const metadata: Metadata = { title: "Partners" };
export const revalidate = 60;

export default async function PartnersPage() {
  const partners = await client.fetch<Partner[]>(partnersQuery);

  return (
    <section id="partners">
      <div className="partners-inner">
        <header className="partners-header">
          <p className="section-eyebrow">Working together</p>
          <h1 className="section-title">Our Partners</h1>
          <p className="section-lead">
            Organizations supporting our work in communities.
          </p>
        </header>
        <PartnersGrid partners={partners} />
      </div>
    </section>
  );
}