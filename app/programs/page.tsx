import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/fetch";
import { formatDateRange } from "@/lib/storybook";
import {
  programsListQuery,
  type ProgramsList,
} from "@/sanity/queries/programs";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Every program is a story. Follow each one day by day and place by place, with the photos, videos and voices from the field.",
};
export const revalidate = 60;

function blurProps(image?: { lqip?: string } | null) {
  return image?.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
}

export default async function ProgramsPage() {
  let programs: ProgramsList[] = [];

  try {
    programs = (await sanityFetch<ProgramsList[]>(programsListQuery, {}, ["program"])) ?? [];
  } catch (error) {
    console.error("Failed to fetch programs:", error);
  }

  programs.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

  return (
    <div className="programs-story-page">
      <header className="programs-page-head">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Programs</span>
        </nav>
        <h1>Programs</h1>
        <p>
          Every program is a story. Follow each one day by day and place by place, with the
          photos, videos and voices from the field.
        </p>
      </header>

      <section className="programs-story-grid" aria-label="All programs">
        {programs.length > 0 ? (
          programs.map((program) => {
            const dateRange = formatDateRange(program.startDate, program.endDate);
            return (
              <article className="program-story-card" key={program._id}>
                <Link href={`/programs/${encodeURIComponent(program.slug)}`} className="program-story-card-link">
                  <div className="program-story-card-cover">
                    {program.cover?.url ? (
                      <Image
                        src={program.cover.url}
                        alt={program.cover.alt || program.title}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                        {...blurProps(program.cover)}
                      />
                    ) : (
                      <span className="program-story-card-cover-fallback" aria-hidden="true" />
                    )}
                  </div>
                  <div className="program-story-card-body">
                    <p className="program-story-card-pill">
                      {program.daysCount} {program.daysCount === 1 ? "day" : "days"} · {program.locationsCount}{" "}
                      {program.locationsCount === 1 ? "location" : "locations"}
                    </p>
                    {dateRange && <time className="program-story-card-date">{dateRange}</time>}
                    <h2>{program.title}</h2>
                    {program.summary && <p className="program-story-card-summary">{program.summary}</p>}
                    <span className="program-story-card-cta">Read the story <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </article>
            );
          })
        ) : (
          <div className="programs-empty">
            <h2>Program stories are on their way</h2>
            <p>Check back soon to follow our work in the field, day by day.</p>
          </div>
        )}
      </section>
    </div>
  );
}
