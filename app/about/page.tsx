import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/fetch";
import { aboutPageMetadataQuery, aboutPageQuery } from "@/sanity/queries/about";

export const revalidate = 60;

type AboutPageContent = {
  title: string | null;
  eyebrow: string | null;
  heading: string | null;
  intro: string | null;
  mission: string | null;
  vision: string | null;
  values: string | null;
  approach: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const content = await sanityFetch<{ seoTitle: string | null; title: string | null } | null>(
      aboutPageMetadataQuery,
      {},
      ["aboutPage"],
    );
    return {
      title: content?.seoTitle || content?.title || "About Us",
      description: "Learn who we are, what we stand for and how we work with communities in Lagos.",
    };
  } catch (error) {
    console.error("Failed to fetch about page metadata:", error);
    return {
      title: "About Us",
      description: "Learn who we are, what we stand for and how we work with communities in Lagos.",
    };
  }
}

export default async function AboutPage() {
  let content: AboutPageContent | null = null;

  try {
    content = await sanityFetch<AboutPageContent | null>(aboutPageQuery, {}, ["aboutPage"]);
  } catch (error) {
    console.error("Failed to fetch about page content:", error);
  }

  const title = content?.heading || content?.title || "About Us";
  const sections = [
    { title: "Our Mission", text: content?.mission },
    { title: "Our Vision", text: content?.vision },
    { title: "Our Values", text: content?.values },
    { title: "Our Approach", text: content?.approach },
  ].filter((section) => section.text);

  return (
    <div className="site-page">
      <header className="site-hero">
        <div className="act-container site-hero-inner">
          <div className="site-hero-copy">
            <h1 className="site-title">{title}</h1>
            {content?.intro ? (
              <p className="site-lead">{content.intro}</p>
            ) : (
              <p className="site-lead">About page content is being prepared.</p>
            )}
          </div>
        </div>
      </header>

      {sections.length > 0 && (
        <section className="act-section" aria-label="About our organization">
          <div className="act-container">
            <div className="site-detail-grid">
              {sections.map((section) => (
                <article className="site-detail" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
