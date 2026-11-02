import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
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
  imageUrl: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await client.fetch<{ seoTitle: string | null; title: string | null } | null>(
    aboutPageMetadataQuery,
  );
  return { title: content?.seoTitle || content?.title || "About Us" };
}

export default async function AboutPage() {
  const content = await client.fetch<AboutPageContent | null>(aboutPageQuery);
  const title = content?.heading || content?.title || "About Us";
  const sections = [
    { title: "Our Mission", text: content?.mission },
    { title: "Our Vision", text: content?.vision },
    { title: "Our Values", text: content?.values },
    { title: "Our Approach", text: content?.approach },
  ].filter((section) => section.text);

  return (
    <div className="about-page">
      <section id="about" className="about-page-intro">
        <div className="about-page-hero about-grid">
          <div className="about-image-block">
            <div className={`about-image-box${content?.imageUrl ? " has-image" : " logo-fallback"}`}>
              <Image
                src={content?.imageUrl || "/images/Logo.svg"}
                alt={content?.imageUrl ? title : "Aromire-Éko Empowerment Foundation"}
                width={600}
                height={600}
                priority
              />
            </div>
          </div>
          <div className="about-content">
            <p className="section-eyebrow">{content?.eyebrow || "Who We Are"}</p>
            <div className="gold-divider" />
            <h1 className="section-title">{title}</h1>
            {content?.intro ? (
              <p className="about-page-intro-text">{content.intro}</p>
            ) : (
              <p className="about-page-intro-text">About page content is being prepared.</p>
            )}
          </div>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="about-page-details" aria-label="About our organization">
          <div className="about-page-details-inner">
            {sections.map((section, index) => (
              <article className="about-page-detail" key={section.title}>
                <span className="about-page-detail-index">0{index + 1}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}