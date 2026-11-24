import Image from "next/image";

import type { Partner } from "@/sanity/queries/partners";

/**
 * Partner logos. On wide screens the first list is a static grid. On small
 * screens the two identical lists form a seamless CSS marquee; the copy is
 * hidden from assistive tech and removed from the tab order.
 */
export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  const group = (copy: boolean) => (
    <ul
      className={`landing-partner-list${copy ? " landing-partner-copy" : ""}`}
      aria-hidden={copy || undefined}
      inert={copy || undefined}
    >
      {partners.map((partner) => {
        const logo = partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.logoAlt || partner.name}
            width={180}
            height={80}
            sizes="(max-width: 600px) 45vw, 180px"
            {...(partner.logoLqip ? { placeholder: "blur" as const, blurDataURL: partner.logoLqip } : {})}
          />
        ) : (
          <span className="landing-partner-name">{partner.name}</span>
        );
        return (
          <li className="landing-partner-item" key={`${copy ? "copy" : "main"}-${partner._id}`}>
            {partner.website ? (
              <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} (opens in a new tab)`}>
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="landing-partner-marquee">
      <div className="landing-partner-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
