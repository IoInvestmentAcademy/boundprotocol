import { motion } from "framer-motion";
import { textReveal } from "../utils/animations";

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

  // Duplicate arrays for seamless infinite scroll
  const topRowDuplicated = [...topRowLogos, ...topRowLogos];
  const bottomRowDuplicated = [...bottomRowLogos, ...bottomRowLogos];

  return (
    <motion.section
      className="w-full bg-white py-10 lg:py-12 px-8 lg:px-10 xl:px-16 overflow-hidden"
      {...textReveal}
    >
      <div className=" mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-8 lg:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px]
            font-semibold leading-[1.2] text-center
            text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Trusted by Industry Leaders
          </motion.h2>
        </motion.div>

        {/* Logos Scrolling Container */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Top Row - Scrolls Left */}
          <div className="overflow-hidden relative">
            <motion.div
              className="flex items-center gap-8 lg:gap-12 xl:gap-16"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {topRowDuplicated.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 px-2"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                    style={{ 
                      height: "48px", 
                      width: "auto",
                      maxWidth: "none",
                      display: "block"
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom Row - Scrolls Right */}
          <div className="overflow-hidden relative">
            <motion.div
              className="flex items-center gap-8 lg:gap-12 xl:gap-16"
              animate={{
                x: ["-50%", "0%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {bottomRowDuplicated.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 px-2"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                    style={{ 
                      height: "48px", 
                      width: "auto",
                      maxWidth: "none",
                      display: "block"
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Partners;
