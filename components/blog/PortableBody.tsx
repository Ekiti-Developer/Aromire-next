import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import type { ComponentProps } from "react";

import type { PortableTextBlock, SanityImage } from "@/lib/sanity/queries";
import YouTubeEmbed from "./YouTubeEmbed";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const image = value as SanityImage;
      if (!image?.url) return null;
      return (
        <figure className="blog-prose-figure">
          <Image
            src={image.url}
            alt={image.alt || ""}
            width={image.width || 1200}
            height={image.height || 800}
            sizes="(max-width: 800px) 100vw, 760px"
            {...(image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {})}
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      );
    },
    youtube: ({ value }) => {
      const video = value as { url?: string; title?: string };
      if (!video?.url) return null;
      return <YouTubeEmbed url={video.url} title={video.title || "Blog video"} />;
    },
    callout: ({ value }) => {
      const callout = value as { title?: string; text?: string };
      return (
        <aside className="blog-prose-callout">
          {callout?.title && <strong>{callout.title}</strong>}
          {callout?.text && <p>{callout.text}</p>}
        </aside>
      );
    },
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = String((value as { href?: string } | undefined)?.href || "#");
      const external = /^https?:\/\//i.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
};

export default function PortableBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="blog-prose">
      <PortableText
        value={value as unknown as ComponentProps<typeof PortableText>["value"]}
        components={components}
      />
    </div>
  );
}
