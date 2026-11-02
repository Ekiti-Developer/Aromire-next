import Image from "next/image";
import type { Partner } from "@/sanity/queries/partners";

export default function PartnersGrid({partners}: {partners: Partner[]}) {
  if (partners.length === 0) {
    return <p className="gallery-empty">No partners have been published yet.</p>;
  }

  return (
    <div className="partners-grid">
      {partners.map((partner) => {
        const logo = (
          <Image
            src={partner.logoUrl}
            alt={partner.logoAlt || partner.name}
            width={240}
            height={120}
            className="partner-logo"
          />
        );

        return partner.website ? (
          <a
            className="partner-logo-link"
            href={partner.website}
            key={partner._id}
            target="_blank"
            rel="noreferrer"
            aria-label={partner.name}
          >
            {logo}
          </a>
        ) : (
          <div className="partner-logo-link" key={partner._id}>
            {logo}
          </div>
        );
      })}
    </div>
  );
}