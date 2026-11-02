"use client";

import { NextStudio } from "next-sanity/studio";
import { StyleSheetManager } from "styled-components";
import config from "@/sanity.config";

const shouldForwardProp = (propName: string) => propName !== "ratio";

export default function SanityStudio() {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <NextStudio config={config} />
    </StyleSheetManager>
  );
}
