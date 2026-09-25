import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
  Mail,
  ShieldCheck,
} from "lucide-react";

const services = [
  "Tax Accountant Consultation",
  "Company Registration",
  "ZIMRA / Tax Registration",
  "Tax Clearance Certificate",
  "Accounting & Bookkeeping",
  "NSSA · PRAZ · ZIMDEF Compliance",
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#021510] text-white">
      
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Gold glow */}
        <div className="absolute top-[-140px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

        {/* Green glow */}
        <div className="absolute bottom-[-180px] right-[-120px] w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-24 pb-10">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr_0.8fr] gap-14 pb-16 border-b border-white/10">
          
          {/* BRAND */}
          <div>
            
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center group mb-8"
            >
              <div
                className="
                  rounded-2xl
                  bg-white/[0.04]
                  backdrop-blur-md
                  border
                  border-white/10
                  px-4
                  py-3
                  transition-all
                  duration-300
                  group-hover:bg-white/[0.06]
                  group-hover:border-[#C9A84C]/20
                "
              >
                <Image
                  src="/images/logos/pre-logo.svg"
                  alt="Premasse Business Services"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Description */}
            <p className="font-body text-white/60 text-base leading-relaxed max-w-md mb-8">
              ZIMRA-registered tax accountants and business specialists helping
              Zimbabwean businesses remain compliant, financially organized,
              and growth-focused.
            </p>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-5">
              {[
                "ZIMRA Registered",
                "SME Specialists",
                "Zimbabwean Business Advisory",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/70" />

                  <span className="text-white/35 text-[11px] tracking-[0.16em] uppercase font-body">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div>
            
            <div className="flex items-center gap-3 mb-6">
              
              <div className="w-8 h-px bg-[#C9A84C]" />

              <h4 className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                Services
              </h4>
            </div>

            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="
                      group
                      flex
                      items-start
                      gap-3
                      text-white/55
                      hover:text-white
                      transition-all
                      duration-300
                    "
                  >
                    <ArrowUpRight className="w-4 h-4 mt-[2px] text-[#C9A84C]/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 shrink-0" />

                    <span className="font-body text-sm leading-relaxed">
                      {service}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            
            <div className="flex items-center gap-3 mb-6">
              
              <div className="w-8 h-px bg-[#C9A84C]" />

              <h4 className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                Contact
              </h4>
            </div>

            {/* Contact cards */}
            <div className="space-y-4 mb-8">
              
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-5
                "
              >
                <div className="flex items-start gap-4">
                  
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#C9A84C]" />
                  </div>

                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Location
                    </p>

                    <p className="text-white/55 text-sm leading-relaxed">
                      Harare, Zimbabwe
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-5
                "
              >
                <div className="flex items-start gap-4">
                  
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#C9A84C]" />
                  </div>

                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Email
                    </p>

                    <a
                      href="mailto:info@premasse.co.zw"
                      className="text-white/55 hover:text-white transition-colors duration-300 text-sm break-all"
                    >
                      info@premasse.co.zw
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/request"
              className="
                group
                relative
                overflow-hidden
                inline-flex
                items-center
                justify-center
                gap-3
                bg-[#C9A84C]
                text-[#041f19]
                font-body
                font-semibold
                px-7
                py-4
                rounded-2xl
                text-sm
                tracking-[0.16em]
                uppercase
                transition-all
                duration-500
                hover:-translate-y-1
                hover:shadow-[0_20px_60px_rgba(201,168,76,0.35)]
              "
            >
              <span className="relative z-10">
                Request a Service
              </span>

              <ArrowUpRight className="relative z-10 w-4 h-4" />

              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
          </div>
        </div>

        {/* MIDDLE TRUST STRIP */}
        <div className="py-8 border-b border-white/10">
          
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              "ZIMRA Registered Practitioners",
              "NSSA · PRAZ · ZIMDEF Compliance",
              "SME Focused Advisory",
              "Zimbabwean Business Specialists",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]/70" />

                <span className="text-white/35 text-[11px] tracking-[0.18em] uppercase font-body">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Copyright */}
          <p className="text-white/30 text-sm font-body">
            © {year} Premasse Business Services. All rights reserved.
          </p>

          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-6">
            {[
              { label: "About", href: "/about" },
              { label: "Services", href: "/services" },
              { label: "Contact", href: "/contact" },
              { label: "Request Service", href: "/request" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="
                  text-white/40
                  hover:text-white
                  text-sm
                  transition-colors
                  duration-300
                "
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Signature */}
          <div
  className="
    relative
    overflow-hidden
    rounded-full
    border
    border-[#C9A84C]/30
    bg-[#C9A84C]/10
    backdrop-blur-md
    px-5
    py-2.5
    shadow-[0_8px_30px_rgba(201,168,76,0.12)]
  "
>
  <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 via-transparent to-[#C9A84C]/10" />

  <p
    className="
      relative
      text-[#C9A84C]
      text-[11px]
      tracking-[0.24em]
      uppercase
      font-semibold
      font-body
      whitespace-nowrap
    "
  >
    WE HELP YOU GROW
  </p>
</div>
        </div>
      </div>
    </footer>
  );
}