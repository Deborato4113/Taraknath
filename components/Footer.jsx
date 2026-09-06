import Link from "next/link";
import Image from "next/image";
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const SERVICE_LINKS = [
  { label: "Shipyard Products", href: "/products/shipyard" },
  { label: "Deck Machinery Components", href: "/products/deck" },
  { label: "Bronze Castings", href: "/products/bronze" },
  { label: "White Metal Lining Bearing and Thrust Pads", href: "/products/bearing" },
  { label: "Babbit Lining Bearing and Thrust Pads", href: "/products/babbit" },
  { label: "Fabrication and Machining", href: "/products/fabrication" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/#about" },
  { label: "Products", href: "/#products" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

        {/* Logo + blurb */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill className="object-contain" />
            </div>
            <div className="leading-tight">
              <span className="block font-bold tracking-wide text-sm heading-font uppercase">
                Taraknath Engineering
              </span>
              <span className="block text-[10px] text-gray-500 mono tracking-widest">
                ISO 9001:2015 CERTIFIED
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Precision-engineered shipyard products, deck machinery components and
            bearings — manufactured in Kolkata for India&apos;s naval and industrial sector.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-sm font-bold heading-font uppercase mb-5">Products</h4>
          <ul className="space-y-3">
            {SERVICE_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                  — {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-bold heading-font uppercase mb-5">Company</h4>
          <ul className="space-y-3">
            {COMPANY_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                  — {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-bold heading-font uppercase mb-5">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-400">9331970742</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <a href="mailto:taraknathengwks@yahoo.co.in" className="text-sm text-gray-400 hover:text-red-500 transition-colors break-all">
                taraknathengwks@yahoo.co.in
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-400">
                135, Rafi Ahmed Kidwai Road, Kolkata – 700 055
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Social row */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-10 flex gap-3">
        {[
          { Icon: Linkedin, href: "#", label: "LinkedIn" },
          { Icon: Facebook, href: "#", label: "Facebook" },
          { Icon: Instagram, href: "#", label: "Instagram" },
          { Icon: Mail, href: "mailto:taraknathengwks@yahoo.co.in", label: "Email" },
        ].map(({ Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="w-10 h-10 bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-600 transition-colors"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2 mono">
          <span>© 2026 Taraknath Engineering Works. All Rights Reserved.</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-red-500 transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}