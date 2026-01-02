import { motion } from "framer-motion";
import { fadeInUp, getHeaderAnimation } from "../utils/scrollAnimations";

function Partners() {
  // Top row logos - duplicate for seamless loop
  const topRowLogos = [
    { name: "Aave", src: "/partners/Aave.svg", alt: "Aave" },
    { name: "Sumsub", src: "/partners/Sumsub.svg", alt: "Sumsub" },
    { name: "Uniswap", src: "/partners/Uniswap.svg", alt: "UNISWAP" },
    { name: "Microsoft", src: "/partners/Microsoft.svg", alt: "Microsoft" },
    { name: "Avantgarde", src: "/partners/Avantgarde.svg", alt: "AVANTGARDE" },
    { name: "Yard Hub", src: "/partners/yard hub.svg", alt: "ya" },
  ];

  // Bottom row logos - duplicate for seamless loop
  const bottomRowLogos = [
    { name: "Goldfinch", src: "/partners/Goldfinch.svg", alt: "dfinch" },
    { name: "Enzyme", src: "/partners/Enzyme.svg", alt: "enzyme" },
    { name: "LI.FI", src: "/partners/LI.FI.svg", alt: "LI.FI" },
    { name: "LayerZero", src: "/partners/LayerZero.svg", alt: "Layer Zero." },
    { name: "Ondo Finance", src: "/partners/Ondo finance.svg", alt: "Ondo" },
    { name: "Pendle", src: "/partners/Pendle.svg", alt: "PENDLE" },
    { name: "Morpho", src: "/partners/Morpho logo.svg", alt: "M" },
  ];

  const mobileRowLogos = [
    { name: "Aave", src: "/partners/Aave.svg", alt: "Aave" },
    { name: "Yard Hub", src: "/partners/yard hub.svg", alt: "ya" },
    { name: "Microsoft", src: "/partners/Microsoft.svg", alt: "Microsoft" },
    { name: "Sumsub", src: "/partners/Sumsub.svg", alt: "Sumsub" },
    { name: "Avantgarde", src: "/partners/Avantgarde.svg", alt: "AVANTGARDE" },
    { name: "Uniswap", src: "/partners/Uniswap.svg", alt: "UNISWAP" },
  ];

  // Duplicate arrays multiple times for seamless infinite scroll
  // Using 3 copies ensures seamless looping - when one set scrolls out, the next identical set continues
  const topRowDuplicated = [...topRowLogos, ...topRowLogos, ...topRowLogos];
  const bottomRowDuplicated = [
    ...bottomRowLogos,
    ...bottomRowLogos,
    ...bottomRowLogos,
  ];

  return (
    <motion.section 
      className="w-full bg-white py-10 lg:py-12 px-8 lg:px-10 xl:px-16 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      variants={fadeInUp}
    >
      <div className=" mx-auto">
        {/* Header */}
        <motion.div 
          className="flex flex-col items-center gap-4 mb-8 lg:mb-10"
          {...getHeaderAnimation()}
        >
          <motion.h2
            className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px]
            font-semibold leading-[1.2] text-center
            text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px]"
            style={{
              color: "#908686",
              textAlign: "center",
              fontFeatureSettings: "'liga' off, 'clig' off",
              fontFamily: "Hanken Grotesk",
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "120%",
              letterSpacing: "-0.2px",
            }}
          >
            Trusted by Industry Leaders
          </motion.h2>
        </motion.div>

        {/* Logos Scrolling Container */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Top Row - Scrolls Left to Right */}
          <div className="overflow-hidden relative w-full">
            <div className="flex items-center gap-8 lg:gap-12 xl:gap-16 animate-scroll-left">
              {topRowDuplicated.map((logo, index) => (
                <div
                  key={`top-${logo.name}-${index}`}
                  className="flex items-center justify-center flex-shrink-0 opacity-60 px-2"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                    pointerEvents: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                    style={{
                      height: "48px",
                      width: "auto",
                      maxWidth: "none",
                      display: "block",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      pointerEvents: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      WebkitTouchCallout: "none",
                    }}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Scrolls Right to Left */}
          <div className="overflow-hidden relative w-full">
            <div className="flex items-center gap-8 lg:gap-12 xl:gap-16 animate-scroll-right">
              {bottomRowDuplicated.map((logo, index) => (
                <div
                  key={`bottom-${logo.name}-${index}`}
                  className="flex items-center justify-center flex-shrink-0 opacity-60 px-2"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                    pointerEvents: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                    style={{
                      height: "48px",
                      width: "auto",
                      maxWidth: "none",
                      display: "block",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      pointerEvents: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      WebkitTouchCallout: "none",
                    }}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* last part only shows on mobile */}
          <div className="block lg:hidden">
            <div className="overflow-hidden relative w-full">
              <div className="flex items-center gap-8 lg:gap-12 xl:gap-16 animate-scroll-left">
                {mobileRowLogos.map((logo, index) => (
                  <div
                    key={`top-${logo.name}-${index}`}
                    className="flex items-center justify-center flex-shrink-0 opacity-60 px-2"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                      WebkitTransform: "translateZ(0)",
                      pointerEvents: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                    }}
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="object-contain"
                      style={{
                        height: "48px",
                        width: "auto",
                        maxWidth: "none",
                        display: "block",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        pointerEvents: "none",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        WebkitTouchCallout: "none",
                      }}
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Partners;
