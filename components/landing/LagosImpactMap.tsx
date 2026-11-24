import type { CSSProperties } from "react";

// Lagos State boundary, simplified from geoBoundaries NGA ADM1 (shapeISO NG-LA)
// and projected into a tight viewBox. Purely decorative — no claims are encoded.
const LAND_PATH =
  "M6 240 L7 325 L226 306 L703 302 L732 276 L1161 265 L1661 332 L1670 262 L1586 244 L1561 256 L1475 216 L1465 193 L1534 153 L1542 129 L1524 104 L1479 96 L1411 146 L1371 128 L1356 85 L1360 66 L1394 54 L1393 21 L1280 8 L760 27 L744 14 L753 59 L694 62 L564 0 L539 80 L494 122 L503 168 L462 192 L378 208 L187 189 L190 219 L159 251 L6 240 Z";

const COMMUNITIES = [
  { name: "Badagry", x: 181, y: 300 },
  { name: "Ikeja", x: 651, y: 120 },
  { name: "Lagos Island", x: 696, y: 245 },
  { name: "Ikorodu", x: 801, y: 90 },
  { name: "Epe", x: 1281, y: 100 },
];

const ROUTES = [
  "M181 300 L651 120 L801 90 L1281 100",
  "M696 245 L651 120",
];

/**
 * A Lagos map that wakes up behind the impact figures: a faint dot-matrix
 * landform at rest that draws its outline, warms to gold and lights the
 * foundation's community pins when the impact section is hovered or focused.
 */
export default function LagosImpactMap() {
  return (
    <svg
      className="lagos-impact-map"
      viewBox="-10 -16 1696 364"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="lagos-land-clip">
          <path d={LAND_PATH} />
        </clipPath>
        <pattern id="lagos-dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle className="lagos-dot" cx="13" cy="13" r="3.4" />
        </pattern>
      </defs>

      <g className="lagos-land-group">
        <g clipPath="url(#lagos-land-clip)">
          <rect className="lagos-wash" x="-10" y="-16" width="1696" height="364" />
          <rect x="-10" y="-16" width="1696" height="364" fill="url(#lagos-dot-grid)" />
        </g>

        <path className="lagos-outline" d={LAND_PATH} pathLength={1} />

        <g className="lagos-routes">
          {ROUTES.map((d, i) => (
            <path
              key={d}
              className="lagos-route"
              d={d}
              pathLength={1}
              style={{ "--route-delay": `${280 + i * 130}ms` } as CSSProperties}
            />
          ))}
        </g>

        <g className="lagos-pins">
          {COMMUNITIES.map((community, i) => (
            <g
              key={community.name}
              className="lagos-pin"
              transform={`translate(${community.x} ${community.y})`}
              style={{ "--pin-delay": `${120 + i * 90}ms` } as CSSProperties}
            >
              <circle className="lagos-pin-halo" r="22" />
              <circle className="lagos-pin-ring" r="10" />
              <circle className="lagos-pin-core" r="4" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
