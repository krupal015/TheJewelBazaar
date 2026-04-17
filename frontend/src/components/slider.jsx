import { Link } from "react-router-dom";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const sliderData = [
  {
    title: "Rings",
    subtitle: "Statement rings designed for everyday shine and special moments.",
    price: "Rs. 75,999",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Pendants",
    subtitle: "Refined pendant pieces with a softer bridal-inspired finish.",
    price: "Rs. 89,499",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Earrings",
    subtitle: "Light-catching earrings made to elevate the full look instantly.",
    price: "Rs. 14,999",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Bracelets",
    subtitle: "Layered bracelet silhouettes with a clean luxury feel.",
    price: "Rs. 28,499",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Necklaces",
    subtitle: "Wedding and occasion necklaces with bold crafted detail.",
    price: "Rs. 99,999",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function Slider() {
  return (
    <section className="container-shell py-8">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
      >
        {sliderData.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative overflow-hidden border border-black bg-white"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "540px",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(252,251,247,0.94)] via-[rgba(252,251,247,0.7)] to-transparent" />
              <div className="relative flex min-h-[540px] items-center px-8 py-10 md:px-14">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-smoke">Signature Drop</p>
                  <h1 className="mt-5 font-display text-5xl leading-none text-black md:text-7xl">{slide.title}</h1>
                  <p className="mt-5 max-w-lg text-base leading-8 text-smoke">{slide.subtitle}</p>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-smoke">
                    Starting at <span className="ml-2 text-black">{slide.price}</span>
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/"
                      state={{ scrollTo: "catalog-section" }}
                      className="inline-flex items-center border border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Shop Now
                    </Link>
                    <Link
                      to="/tracking"
                      className="inline-flex items-center border border-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/80"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
