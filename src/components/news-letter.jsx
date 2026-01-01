import { motion } from "framer-motion";
import {
  textReveal,
  staggerContainer,
  staggerItem,
  buttonHover,
  fadeInUp,
} from "../utils/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";

function NewsLetter() {
  const prefersReducedMotion = useReducedMotion();
  // Map company links to section IDs
  const getSectionId = (link) => {
    const sectionMap = {
      "About Us": "mission",
      "Features": "features",
      "How it Works": "how-it-works",
      "Our Teams": "leadership",
      "Blog": "home", // or wherever blog section is
    };
    return sectionMap[link] || "";
  };

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    const sectionId = getSectionId(link);
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 100; // Offset for fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  // Disable animations if user prefers reduced motion
  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.25, ease: "linear" },
      };

  return (
    <section
      className="w-full bg-[#19174F] py-12 lg:py-20 xl:py-20 px-5 lg:px-10 xl:px-[10rem] mx-auto"
    >
      <motion.div
        className="w-[100%] flex flex-col lg:inline-flex lg:flex-row justify-between items-center lg:items-center gap-8 lg:gap-0"
        {...animationProps}
      >
        <div className="w-full lg:w-[480px] flex flex-col justify-start items-start gap-3">
          <div className="self-stretch justify-start text-white text-2xl sm:text-3xl lg:text-4xl font-semibold font-['Hanken_Grotesk'] leading-tight lg:leading-[52px]">
            Stay Ahead in the Investment Game
          </div>
          <div className="self-stretch justify-start text-stone-300 text-base sm:text-lg lg:text-xl font-medium font-['Hanken_Grotesk'] leading-6 lg:leading-8">
            Subscribe to our newsletter for exclusive insights, updates, and
            opportunities in decentralized finance.
          </div>
        </div>
        <div className="w-full lg:w-auto flex flex-col justify-center items-start gap-6">
          <div
            className="w-full lg:w-96 px-6 py-5 bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/25 flex justify-center items-center gap-3"
          >
            <div className="flex-shrink-0">
              <img
                src="/envelope.svg"
                alt=""
                className="w-5 h-5"
                aria-hidden="true"
                loading="lazy"
              />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent text-white placeholder-white/70 outline-none text-base font-normal font-['Hanken_Grotesk']"
            />
          </div>
          <motion.div
            className="p-4 bg-white rounded-lg outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center gap-1 cursor-pointer"
            {...(prefersReducedMotion ? {} : buttonHover)}
          >
            <div className="justify-start text-violet-600 text-lg font-semibold font-['Hanken_Grotesk'] leading-5">
              Subscribe Now
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="w-[100%] flex flex-col lg:inline-flex lg:flex-row justify-between items-start gap-8 lg:gap-0 mt-12 lg:mt-40"
        {...animationProps}
      >
        <div className="w-full flex flex-col justify-start items-start gap-4">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="w-full lg:w-96 justify-start text-white/80 text-sm sm:text-base font-normal font-['Hanken_Grotesk'] leading-6">
              BOUND combines blockchain innovation with traditional finance to
              provide secure, scalable, and transparent investment solutions.
            </div>
          </div>
        </div>
        <div className="w-full lg:w-auto flex flex-col lg:flex-row justify-start items-start gap-8 lg:gap-16">
          {/* COMPANY and CONTACT US - Side by side on mobile */}
          <div className="w-full lg:w-auto flex flex-row justify-start items-start gap-6 sm:gap-8 lg:gap-16">
            <div className="flex flex-col justify-start items-start gap-4 flex-1">
              <div className="justify-start text-stone-300 text-base sm:text-lg font-semibold font-['Hanken_Grotesk']">
                COMPANY
              </div>
              <div className="flex flex-col justify-start items-start gap-3 sm:gap-4">
                <a
                  href="#mission"
                  onClick={(e) => handleLinkClick(e, "About Us")}
                  className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-violet-400 transition-colors"
                >
                  About Us
                </a>
                <a
                  href="#features"
                  onClick={(e) => handleLinkClick(e, "Features")}
                  className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-violet-400 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleLinkClick(e, "How it Works")}
                  className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-violet-400 transition-colors"
                >
                  How it Works
                </a>
                <a
                  href="#leadership"
                  onClick={(e) => handleLinkClick(e, "Our Teams")}
                  className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-violet-400 transition-colors"
                >
                  Our Teams
                </a>
                <a
                  href="#home"
                  onClick={(e) => handleLinkClick(e, "Blog")}
                  className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-violet-400 transition-colors"
                >
                  Blog
                </a>
              </div>
            </div>
            <div className="flex flex-col justify-start items-start gap-4 flex-1">
              <div className="justify-start text-stone-300 text-base sm:text-lg font-semibold font-['Hanken_Grotesk']">
                CONTACT US
              </div>
              <div className="flex flex-col justify-start items-start gap-3 sm:gap-4">
                <div className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk']">
                  contact@boundprotocol.com
                </div>
                <div className="justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk']">
                  (123) 456-7890
                </div>
                <div className="self-stretch justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk']">
                  1234 Investment Lane, Blockchain City, Future State 56789
                </div>
              </div>
            </div>
          </div>
          {/* FOLLOW US - Below on mobile, side by side on desktop */}
          <div className="flex flex-col justify-start items-start gap-4">
            <div className="justify-start text-stone-300 text-base sm:text-lg font-semibold font-['Hanken_Grotesk']">
              FOLLOW US
            </div>
            <div className="w-full lg:w-44 flex flex-col justify-start items-start gap-4">
              <div className="self-stretch justify-start text-white text-sm sm:text-base font-medium font-['Hanken_Grotesk']">
                Stay connected through our social channels:
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <div className="p-2 bg-white rounded-[999px] flex justify-center items-center gap-1">
                  <div
                    data-svg-wrapper
                    data-color="Negative"
                    data-platform="X (Twitter)"
                    className="relative"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.7447 1.42773H16.2748L10.7473 7.74535L17.25 16.3422H12.1584L8.17053 11.1283L3.60746 16.3422H1.07582L6.98808 9.58481L0.75 1.42773H5.97083L9.57555 6.19348L13.7447 1.42773ZM12.8567 14.8278H14.2587L5.20905 2.86258H3.7046L12.8567 14.8278Z"
                        fill="#0A091F"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-[100%] flex flex-col-reverse lg:flex-row justify-between items-center gap-4 lg:gap-0 mt-12 lg:mt-20"
        {...animationProps}
      >
        <div className="justify-start text-stone-300 text-sm sm:text-base font-medium font-['Hanken_Grotesk'] text-center lg:text-left">
          © 2026 BOUND Protocol. All Rights Reserved.
        </div>
        <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center sm:items-start gap-4 sm:gap-6 lg:gap-10">
          <div className="justify-start text-stone-300 text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-white transition-colors">
            Terms of Service
          </div>
          <div className="justify-start text-stone-300 text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-white transition-colors">
            Privacy{" "}
          </div>
          <div className="justify-start text-stone-300 text-sm sm:text-base font-medium font-['Hanken_Grotesk'] cursor-pointer hover:text-white transition-colors">
            Disclaimer & Risk Disclosure
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default NewsLetter;
