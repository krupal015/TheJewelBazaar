import { Crown, Gem, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    title: "Craft Meets Clarity",
    description:
      "We present jewellery with honest detail, refined visuals, and clean product information so every choice feels confident.",
    icon: Gem,
  },
  {
    title: "Modern Luxury Rhythm",
    description:
      "The experience is designed to feel elevated but easy, from collection browsing to checkout, tracking, and repeat ordering.",
    icon: Sparkles,
  },
  {
    title: "Trust In The Process",
    description:
      "Transparent pricing, secure payments, and order visibility are treated as part of the luxury experience, not as background features.",
    icon: ShieldCheck,
  },
];

const promises = [
  "Curated collections that balance occasion dressing with everyday elegance.",
  "Detailed product presentation so customers can browse with more confidence.",
  "A storefront flow built for real shopping momentum, not just visual display.",
];

const processSteps = [
  {
    label: "01",
    title: "Curate",
    description:
      "We shape the catalogue around statement pieces, bridal essentials, and gift-worthy silhouettes that feel timeless rather than trend-bound.",
  },
  {
    label: "02",
    title: "Present",
    description:
      "Each product is framed with clean descriptions, material visibility, and a smoother browsing rhythm to keep the focus on the jewellery itself.",
  },
  {
    label: "03",
    title: "Deliver",
    description:
      "From secure checkout to order tracking, the goal is to make premium shopping feel calm, clear, and dependable all the way through.",
  },
];

function About() {
  return (
    <div className="bg-base pb-16 text-black">
      <section className="container-shell py-8">
        <div className="grid overflow-hidden border border-black bg-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative p-8 sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,149,86,0.15),transparent_46%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-smoke">About The Jewel Bazzar</p>
              <h1 className="mt-5 max-w-3xl font-display text-6xl leading-[0.92] sm:text-7xl">
                Designed to make jewellery shopping feel more intentional.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-smoke sm:text-base">
                The Jewel Bazzar is built around a simple idea: premium jewellery deserves a storefront that feels clear,
                composed, and confident. We blend curated pieces with a calmer digital experience so customers can move
                from discovery to delivery without friction.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/"
                  state={{ scrollTo: "catalog-section" }}
                  className="inline-flex items-center rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
                >
                  Explore Collections
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="border border-black/10 bg-panel px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Approach</p>
                  <p className="mt-3 text-2xl font-semibold">Curated</p>
                </div>
                <div className="border border-black/10 bg-panel px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Experience</p>
                  <p className="mt-3 text-2xl font-semibold">Modern</p>
                </div>
                <div className="border border-black/10 bg-panel px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Promise</p>
                  <p className="mt-3 text-2xl font-semibold">Reliable</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-black lg:border-l lg:border-t-0">
            <div className="min-h-[340px] border-b border-black bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="border-b border-black p-6 sm:border-b-0 sm:border-r">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-panel">
                  <Crown size={20} />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Signature Feel</p>
                <p className="mt-3 text-sm leading-7 text-smoke">
                  A storefront language inspired by editorial luxury rather than crowded marketplace layouts.
                </p>
              </div>
              <div className="p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-panel">
                  <PackageCheck size={20} />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Customer Journey</p>
                <p className="mt-3 text-sm leading-7 text-smoke">
                  Browsing, checkout, and order tracking are treated as one connected premium experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-black bg-white p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">What We Believe</p>
            <h2 className="mt-4 font-display text-5xl leading-none">Luxury should still feel usable.</h2>
          </div>
          <div className="border border-black bg-white p-8 sm:p-10">
            <div className="space-y-5 text-sm leading-8 text-smoke sm:text-base">
              <p>
                Jewellery shopping often swings between two extremes: either overly transactional or overly theatrical.
                The Jewel Bazzar aims for something stronger in the middle, a space where elegance, clarity, and trust
                work together.
              </p>
              <p>
                That means cleaner discovery, stronger product framing, and a purchase flow that respects the customer’s
                time while still feeling premium. We want the pieces to carry the emotion and the platform to carry the confidence.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {promises.map((promise) => (
                <div key={promise} className="flex items-start gap-4 border border-black/10 bg-panel px-5 py-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#b7791f]" />
                  <p className="text-sm leading-7 text-smoke">{promise}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="border border-black bg-white p-8 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">Our Values</p>
            <h2 className="mt-4 font-display text-5xl leading-none">A brand language built around trust, polish, and pace.</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article key={value.title} className="border border-black/10 bg-panel p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 font-display text-3xl leading-none">{value.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-smoke">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden border border-black bg-[url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center min-h-[520px]" />

          <div className="border border-black bg-white p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">How We Build The Experience</p>
            <h2 className="mt-4 font-display text-5xl leading-none">From collection mood to confident checkout.</h2>

            <div className="mt-10 space-y-5">
              {processSteps.map((step) => (
                <div key={step.label} className="grid gap-4 border border-black/10 bg-panel p-5 sm:grid-cols-[72px_1fr]">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">{step.label}</div>
                  <div>
                    <h3 className="font-display text-3xl leading-none">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-smoke">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="overflow-hidden border border-black bg-white">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">Step Into The Bazaar</p>
              <h2 className="mt-4 font-display text-5xl leading-none">Explore the collection with a little more context and a lot less noise.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-smoke sm:text-base">
                Whether someone arrives for a bridal piece, a gift, or a signature everyday design, the goal is the same:
                help them move through the experience with clarity, confidence, and a sense of occasion.
              </p>
            </div>

            <div className="border-t border-black bg-panel p-8 sm:border-l sm:border-t-0 sm:p-10">
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Start Here</p>
                  <p className="mt-4 text-sm leading-8 text-smoke">
                    Browse the catalogue, save pieces to your wishlist, and follow your orders with a more premium rhythm.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/"
                    state={{ scrollTo: "catalog-section" }}
                    className="inline-flex items-center rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Shop Collections
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-full border border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-white"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
