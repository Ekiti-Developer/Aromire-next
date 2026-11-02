import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">Aromire-Éko</div>
            <div className="footer-brand-sub">Empowerment Foundation</div>
            <p className="footer-about">
              Transforming communities through youth empowerment, women&apos;s advancement, and
              sustainable development. Every action creates a ripple of lasting change.
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-heading">Navigate</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/partners">Partners</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-heading">Gallery</h3>
            <ul>
              <li><Link href="/gallery">Outreach Moments</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-heading">Get Involved</h3>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Aromire-Éko Empowerment Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
