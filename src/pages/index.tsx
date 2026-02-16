import { useState, useEffect } from "react";
import AboutUs from "@/components/about-us";
import Comparison from "@/components/comparision";
import Step from "@/components/step";
import Featured from "@/components/featured";
import Banner from "@/components/banner";
import Team from "@/components/team";
import NewsLetter from "@/components/news-letter";
import Partners from "@/components/partners";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for navbar effect (desktop only)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const sectionIds = [
      "home",
      "mission",
      "features",
      "how-it-works",
      "leadership",
      "contact-us",
    ];
    const sectionToLink: { [key: string]: string } = {
      home: "Home",
      mission: "Mission",
      features: "Features",
      "how-it-works": "How It Works",
      leadership: "Leadership",
      "contact-us": "Contact Us",
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger when section is in the upper-middle of viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const linkName = sectionToLink[sectionId];
          if (linkName) {
            setActiveLink(linkName);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    "Home",
    "Mission",
    "Features",
    "How It Works",
    "Leadership",
    "Contact Us",
  ];

  // Map nav links to section IDs
  const getSectionId = (link: string) => {
    const sectionMap = {
      Home: "home",
      Mission: "mission",
      Features: "features",
      "How It Works": "how-it-works",
      Leadership: "leadership",
      "Contact Us": "contact-us",
    };
    return sectionMap[link as keyof typeof sectionMap] || "";
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string
  ) => {
    e.preventDefault();
    setActiveLink(link);
    setIsMenuOpen(false);

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

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <div>
      <div className="max-w-[1440px] mx-auto relative min-h-screen">
        {/* Header / Navigation - Static on mobile, Fixed on desktop */}
        <header className="w-full px-4 py-3 sm:px-5 sm:py-4 lg:px-10 lg:py-5 xl:px-20 xl:py-5 flex justify-between items-center z-[1000] bg-white lg:bg-transparent lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:max-w-[1440px] lg:mx-auto">
          {/* Logo - Fades out on desktop when scrolling */}
          <div
            className={`flex flex-col items-center transition-opacity duration-300
              ${
                isScrolled
                  ? "lg:opacity-0 lg:pointer-events-none"
                  : "lg:opacity-100"
              }`}
          >
            <img
              src="/boundprotocollogo.png"
              alt="BOUND PROTOCOL"
              className="h-10 sm:h-[50px] md:h-[65px] w-auto"
              loading="lazy"
            />
          </div>

          {/* Hamburger Menu */}
          <button
            type="button"
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 cursor-pointer z-[1002] relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-[#1a1a1a] rounded-sm transition-all duration-300 ease-in-out ${
                isMenuOpen ? "rotate-45 translate-y-[3px]" : "-translate-y-1"
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#1a1a1a] rounded-sm transition-all duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0 scale-0" : "opacity-100"
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#1a1a1a] rounded-sm transition-all duration-300 ease-in-out ${
                isMenuOpen ? "-rotate-45 -translate-y-[3px]" : "translate-y-1"
              }`}
            />
          </button>

          {/* Desktop Nav Links - Glass effect on scroll */}
          <nav
            className={`hidden lg:flex lg:items-center lg:gap-7 transition-all duration-500 ease-out
              ${isScrolled ? "px-8 py-3.5 rounded-full" : ""}`}
            style={
              isScrolled
                ? {
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }
                : {}
            }
          >
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${getSectionId(link)}`}
                onClick={(e) => handleLinkClick(e, link)}
                className={`text-[14px] font-medium uppercase no-underline transition-colors duration-300
                ${activeLink === link ? "text-[#6033FF]" : "text-[#4D4D4D]"}
                hover:text-[#6033FF]`}
              >
                {link}
              </a>
            ))}
          </nav>
        </header>

        {/* Spacer for fixed header on desktop */}
        <div className="hidden lg:block lg:h-[85px]" />

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-[1000] lg:hidden transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Mobile Nav Drawer */}
        <nav
          className={`fixed top-0 right-0 w-[280px] h-full bg-white z-[1001] lg:hidden
          transform transition-transform duration-300 ease-in-out
          shadow-[-4px_0_15px_rgba(0,0,0,0.1)]
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Close button inside nav */}
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:text-[#6033FF] transition-colors"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Nav Links */}
          <div className="flex flex-col pt-20 px-8 gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${getSectionId(link)}`}
                onClick={(e) => handleLinkClick(e, link)}
                className={`text-base font-medium uppercase no-underline transition-colors duration-300
                py-4 border-b border-[#f0f0f0] last:border-b-0
                ${activeLink === link ? "text-[#6033FF]" : "text-[#4D4D4D]"}
                hover:text-[#6033FF]`}
              >
                {link}
              </a>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main
          id="home"
          className="flex flex-col lg:flex-row justify-between items-center 
        px-5 py-6 lg:px-10 lg:py-10 xl:px-20 xl:py-15
        min-h-[calc(100vh-105px)] relative text-center lg:text-left"
        >
          {/* Phone Mockup Video - Mobile First */}
          <div
            className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 
          z-[1] w-full lg:w-auto order-1 lg:order-2"
          >
            {/* Mobile Video - Shows on mobile/tablet, hidden on desktop */}
            <video
              src="/herovideomobile.mp4"
              poster="/backgroundmobile.png"
              autoPlay
              loop
              muted
              playsInline
              className="block lg:hidden max-h-[220px] sm:max-h-[280px] md:max-h-[320px] w-auto object-contain mx-auto border-0 outline-none"
              style={{ border: "none", outline: "none" }}
            />
            {/* Desktop Video - Hidden on mobile/tablet, shows on desktop */}
            <video
              src="/herovideo.mp4"
              poster="/background-image.png"
              autoPlay
              loop
              muted
              playsInline
              className="hidden lg:block max-h-[500px] xl:max-h-[700px] w-auto object-contain lg:mx-0 border-0 outline-none"
              style={{ border: "none", outline: "none" }}
            />
          </div>

          {/* Divider - Mobile Only */}
          <div className="w-full h-px bg-[#E5EAF2] my-8 lg:hidden order-2" />

          {/* Left Content */}
          <div className="max-w-full lg:max-w-[550px] z-[2] mb-0 lg:mb-0 order-3 lg:order-1 w-full px-2 lg:px-0">
            <h1
              className="text-[28px] sm:text-[32px] md:text-[40px] lg:text-[56px] xl:text-[65px] 
            font-semibold leading-[1.2] sm:leading-[1.15] lg:leading-[1.15] 
            mb-4 sm:mb-4 lg:mb-5 text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px]"
            >
              Grow Your Savings 
              <br className="hidden lg:block" />
              <span className="lg:block">with Better Rates</span>
            </h1>
            <p
              className="text-[15px] sm:text-base md:text-lg lg:text-xl font-normal leading-[1.6] 
            mb-6 sm:mb-6 lg:mb-7 max-w-[320px] sm:max-w-full lg:max-w-[480px] text-[#4D4D4D] mx-auto lg:mx-0"
            >
              Access better savings rates through a simple savings app powered
              by on-chain financial markets.
            </p>

            {/* APY Rate */}
            <div className="mb-8 sm:mb-7 lg:mb-9">
              <span className="text-[#6D5EED] text-[15px] sm:text-base lg:text-[19px] font-medium">
                BOUND savings rate{" "}
              </span>
              <span className="relative inline-block">
                <span className="text-[#6D5EED] text-[18px] sm:text-base lg:text-[19px] font-semibold">
                  18.83% APY
                  <svg
                    className="absolute bottom-[-20px] left-[-24px] w-full"
                    width="75"
                    height="10"
                    viewBox="0 0 75 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    style={{ height: "21px", width: "128%" }}
                  >
                    <defs>
                      <linearGradient
                        id="underlineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#1A88F8" />
                        <stop offset="100%" stopColor="#9896FF" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M13.9316 3.167C13.8663 3.18298 13.8009 3.19897 13.7355 3.21498C13.9245 3.20405 14.1767 3.17371 14.3518 3.16737C14.3804 3.16638 14.3091 3.20175 14.3766 3.19693C14.4442 3.19212 14.4276 3.15408 14.5253 3.14106C14.6328 3.12668 15.146 3.1085 15.3211 3.09257C15.9794 3.03212 16.6333 2.95391 17.2938 2.91593C16.6147 3.00139 17.3039 2.9739 17.4935 2.94583C17.5354 2.93959 17.5235 2.86661 18.2064 2.83035C18.6398 2.80771 18.2492 2.94328 18.9654 2.83467C18.4059 2.805 18.9509 2.76722 19.3848 2.73161C19.4603 2.72528 20.0696 2.69018 20.3372 2.66731C20.4288 2.65941 20.5657 2.61091 20.6871 2.60105C20.7706 2.59429 20.8354 2.61059 20.9593 2.60057C21.5354 2.55427 22.1081 2.51266 22.6892 2.48062C22.3565 2.6018 22.9583 2.50456 22.9857 2.50757C23.1257 2.52498 22.501 2.57448 22.7494 2.57457C23.0948 2.5483 23.4396 2.52256 23.7839 2.49735C23.4999 2.50349 24.1538 2.39043 24.2783 2.41505C24.2202 2.33071 25.8599 2.39369 26.1042 2.35143C26.156 2.34238 25.8136 2.31868 26.6014 2.29342C26.6867 2.29079 26.656 2.31883 26.7005 2.31387C26.7271 2.3109 26.8842 2.21844 27.059 2.25497C27.1227 2.26843 26.724 2.34487 27.6055 2.27483C27.2497 2.20849 28.8258 2.16398 29.1184 2.17168C29.0599 2.16317 29.0013 2.15467 28.9427 2.14619C29.2313 2.16255 29.2815 2.13124 29.3462 2.12961C29.607 2.12309 29.966 2.13502 30.208 2.12105C30.4915 2.10476 30.4889 2.05196 30.8216 2.05741C30.7425 2.04932 30.663 2.04127 30.5842 2.03321C30.8129 2.02553 31.0421 2.01804 31.2709 2.01077C30.7443 2.10414 31.3853 2.00899 31.4276 2.00573C31.4952 2.00024 31.3992 2.03307 31.5122 2.02459C31.5238 2.02351 31.5058 1.99727 31.6799 1.98673C32.0438 1.96493 31.9876 2.00133 32.1404 1.99452C32.1544 1.99378 32.1044 1.97149 32.368 1.95484C33.2055 1.90244 32.3646 1.9735 32.3326 1.97829C32.2905 1.98455 32.5823 2.07374 31.8684 2.06775C32.1081 2.06906 32.134 2.113 32.161 2.11297C32.1849 2.11284 32.5988 2.08947 32.6216 2.08706C32.8245 2.06358 32.6442 2.04015 32.6836 2.03305C32.7155 2.02724 33.2172 2.04735 33.3308 1.95064C33.5733 2.02655 33.196 2.03308 32.7956 2.06226C32.7376 2.08203 33.1789 2.08151 33.202 2.08062C33.7701 2.05847 33.4528 2.00067 33.5753 1.95114C33.6397 1.92523 33.8729 1.96426 33.6569 1.90956C34.1722 1.88356 33.8609 1.9317 33.8944 1.93581C33.9449 1.94184 34.1246 1.91719 34.1473 1.91877C34.1805 1.9211 34.0662 1.94705 34.197 1.94993C34.2188 1.95025 34.4279 1.90518 34.1559 1.8972C34.5186 1.8893 34.4876 1.85859 34.6128 1.91847C34.8582 1.78805 34.7965 1.98397 34.8949 1.98734C35.1568 1.99626 35.0778 1.90343 35.0914 1.89829C35.1857 1.86503 35.9111 1.87377 36.0899 1.85449C36.0214 1.92543 35.5159 1.8738 35.4037 1.89101C35.0299 1.94793 35.9337 1.90782 35.664 2.00329C35.7775 1.9758 35.8909 1.94836 36.0044 1.92097C36.2156 1.9699 35.9193 2.00337 36.4821 1.96549C36.5728 1.91464 36.084 1.9855 36.1812 1.94466C36.2385 1.92062 36.5651 1.90572 36.5712 1.89387C36.5772 1.87958 36.2824 1.9054 36.3283 1.88233C36.4285 1.83218 37.507 1.84447 36.6878 1.89452C36.9165 1.8868 37.037 1.9762 37.2344 1.94148C37.3622 1.91907 36.6368 1.81133 37.7202 1.80401C37.7445 1.84717 37.2877 1.82919 37.2759 1.83293C37.2594 1.83827 37.3448 1.93487 37.3592 1.93934C37.4101 1.95364 38.5141 1.8703 38.749 1.9145C38.655 1.85945 39.5843 1.88353 39.6846 1.86402C39.7114 1.85857 39.6101 1.82588 39.6388 1.82149C39.8176 1.79515 40.3041 1.84679 40.5293 1.84366C40.7812 1.84014 40.7487 1.81059 40.7628 1.81034C40.8737 1.80972 40.7855 1.83208 40.8533 1.83062C40.9556 1.82825 41.6596 1.81862 41.6949 1.8138C41.7052 1.81228 41.5897 1.77986 41.7429 1.77041C41.7695 1.76882 41.7533 1.80996 42.2068 1.78411C42.7532 1.7532 41.8263 1.73987 42.0527 1.69292C42.405 1.74776 42.3925 1.68748 42.4878 1.69058C42.5209 1.69174 42.7672 1.73905 43.0339 1.73154C42.8426 1.74296 42.6513 1.75449 42.4602 1.76614C42.6484 1.7719 43.0136 1.75474 43.1688 1.76255C43.2445 1.76633 43.1829 1.80961 43.3472 1.80593C43.3821 1.80495 43.5189 1.69964 43.0891 1.75263C43.0541 1.71636 43.2593 1.7371 43.3542 1.72524C43.3685 1.7234 43.4243 1.66103 43.5463 1.69744C43.5755 1.70649 43.2612 1.89024 44.0772 1.74878C44.1035 1.74423 44.0117 1.72303 44.0374 1.71802C44.0549 1.71461 44.2635 1.72085 44.2865 1.71736C44.31 1.71363 44.209 1.69045 44.2369 1.68525C44.3804 1.65844 44.5705 1.75325 44.2738 1.74976C44.3731 1.76046 44.4724 1.77118 44.5717 1.78193C44.4647 1.70998 44.7272 1.75929 44.8644 1.75538C45.7442 1.73054 45.1544 1.68983 45.3054 1.66337C45.5485 1.62104 45.3638 1.74852 45.725 1.70694C45.7585 1.70313 45.3206 1.65419 46.1748 1.67566C46.049 1.67895 45.9227 1.68229 45.7968 1.68568C45.8701 1.7558 46.252 1.67624 46.2808 1.67501C46.6149 1.66219 46.3891 1.68971 46.8854 1.64894C46.9297 1.64529 47.0265 1.66199 47.1213 1.65252C47.5144 1.61342 46.6021 1.63486 46.5771 1.60655C46.565 1.59238 47.5463 1.58804 47.5803 1.5947C47.7237 1.62326 47.1352 1.611 47.2477 1.64696C47.2881 1.65929 48.6898 1.62348 48.9685 1.637C49.292 1.65219 49.4383 1.74786 49.4399 1.6398C49.5317 1.74551 49.6121 1.67287 49.6536 1.67346C50.1548 1.68167 50.1558 1.68278 50.5864 1.67174C50.6815 1.66936 50.7609 1.70141 50.7945 1.69593C50.8139 1.69262 50.7775 1.65823 50.8728 1.64747C51.005 1.63262 51.8024 1.66763 51.862 1.6868C51.9213 1.70582 51.5249 1.69506 51.596 1.72636C51.8828 1.72946 52.1581 1.72183 52.4476 1.72544C52.5678 1.72703 52.506 1.74887 52.558 1.74937C52.58 1.74963 52.9958 1.731 52.9775 1.72292C52.9369 1.70375 51.6547 1.71537 51.9924 1.67731C52.0574 1.66992 52.2873 1.72055 52.2508 1.65915C53.3957 1.67395 54.5369 1.69174 55.6787 1.71207C55.0274 1.7543 54.2805 1.71001 53.5955 1.71245C53.5014 1.7127 53.1836 1.70603 53.2222 1.73715C53.805 1.74643 54.5324 1.7329 55.0961 1.7559C55.1142 1.75665 55.0478 1.78421 55.1154 1.78895C55.2415 1.79778 55.6491 1.755 55.718 1.76704C55.7297 1.76981 55.4971 1.80527 55.5677 1.82901C55.7487 1.88994 55.7955 1.75748 55.9517 1.75998C56.0722 1.76186 56.885 1.83141 57.0887 1.79248C57.3048 1.75081 56.4884 1.76309 56.5491 1.72825C57.1013 1.69644 57.6606 1.73872 58.1787 1.73879C58.1878 1.73876 58.1086 1.71038 58.2246 1.70751C58.4264 1.70253 58.4791 1.7423 58.5774 1.74948C58.6833 1.75711 59.059 1.75504 59.1092 1.76986C59.1156 1.7718 59.039 1.81002 59.0275 1.81101C58.8636 1.8255 58.8061 1.7744 58.7912 1.77361C58.7353 1.77117 58.6802 1.79003 58.6292 1.78841C58.5454 1.78572 58.4993 1.76738 58.3887 1.76481C58.3124 1.76297 58.3857 1.79803 58.3122 1.79581C58.2852 1.79484 57.9948 1.71376 57.9671 1.79375C57.9554 1.81822 60.3464 1.87387 60.5804 1.85705C60.3765 1.84512 60.1728 1.83325 59.9695 1.82145C60.3822 1.84928 60.8813 1.79092 60.9156 1.88614C62.4604 1.91174 63.9987 1.94072 65.532 1.97207C65.8065 1.98439 65.6546 2.04294 66.1076 2.03232C65.9909 2.01106 65.8742 1.98982 65.7577 1.9686C65.9872 1.98569 67.0232 2.02893 67.1841 2.0191C67.2055 2.01781 67.236 1.96314 67.4915 1.96265C67.7184 1.96225 67.7542 2.00418 67.8755 2.01414C67.9774 2.02239 68.0923 2.01352 68.1226 2.01631C68.1458 2.01854 68.1546 2.04395 68.2105 2.04931C68.3871 2.06595 68.2449 1.99237 68.4192 2.07706C68.3764 2.07944 68.3336 2.08182 68.2908 2.0842C68.504 2.09967 68.7956 2.1418 68.4804 2.15466C68.4262 2.15689 68.4731 2.13325 68.4327 2.1326C66.8563 2.11041 68.1125 2.17907 68.668 2.15076C68.8097 2.18938 69.6098 2.18136 69.6334 2.18895C69.6698 2.19994 69.5339 2.22646 69.7109 2.25461C69.7474 2.26049 70.8094 2.25943 70.4262 2.30063C70.3468 2.30911 69.8386 2.28952 69.7165 2.28878C70.0024 2.37062 70.6817 2.27296 70.7583 2.2772C71.0659 2.29479 70.1658 2.33291 70.8591 2.3545C71.393 2.37117 70.8925 2.3107 71.0983 2.2926C71.2138 2.28243 71.8192 2.35018 71.8043 2.27678C72.0108 2.27284 71.8892 2.30929 71.9147 2.31255C71.9393 2.31546 72.3441 2.30118 72.4755 2.3191C72.4914 2.32132 72.4404 2.35836 72.4569 2.36178C72.4887 2.36771 72.8802 2.36756 72.8962 2.36465C72.9062 2.3626 72.8135 2.32755 72.852 2.32021C72.8968 2.31176 73.2742 2.32682 73.2954 2.31771C73.3249 2.30389 72.8587 2.30444 72.9371 2.26873C73.1515 2.28219 73.5026 2.26411 73.6456 2.23692C73.6105 2.24481 73.4016 2.24201 73.3293 2.2376C73.3642 2.18376 73.813 2.19317 73.6587 2.23333C73.7568 2.21205 73.6904 2.19848 73.7458 2.17768C73.7603 2.17243 73.8991 2.17397 73.926 2.16506C73.9295 2.16325 73.7867 2.13991 73.8156 2.1294C73.8678 2.1104 74.2891 2.12309 74.3237 2.12902C74.4205 2.14578 74.0762 2.15707 74.0472 2.1795C74.043 2.18295 74.3346 2.23368 74.339 2.23774C74.3552 2.28075 74.0304 2.24366 74.0669 2.28281C74.1471 2.29249 74.2274 2.30217 74.3078 2.31186C73.9961 2.3447 73.4243 2.31363 73.2765 2.35508C73.7341 2.35069 74.2159 2.36164 74.2129 2.46129C74.2118 2.50326 74.0129 2.52401 74.0203 2.53483C74.0488 2.57359 74.3252 2.53747 74.3354 2.53968C74.3437 2.54218 74.3475 2.54452 74.3475 2.54672"
                      stroke="url(#underlineGradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>

              <span
                className="text-[#6D5EED] text-[15px] sm:text-base lg:text-[19px] font-semibold 
              pb-0.5"
              ></span>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-3 lg:gap-4 justify-center lg:justify-start w-full max-w-[400px] mx-auto lg:mx-0 lg:max-w-none">
              <a
              href="https://app.boundprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base bg-[#6D5EED] text-white 
              flex-1 lg:flex-none lg:w-auto
              px-6 py-4 lg:px-7 lg:py-4
              text-base rounded-lg"
              >
                Start Earning
              </a>
              {/* add border */}
              <a
                href="https://whitepaper.boundprotocol.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base bg-transparent text-[#4D4D4D] border-0 lg:border lg:border-[#E5EAF2] lg:bg-white
              flex-1 lg:flex-none lg:w-auto
              px-6 py-3 lg:px-7 lg:py-4
              text-base font-medium
              hover:text-[#6D5EED] lg:hover:text-[#738095]"
                style={{ border: "1px solid #E5EAF2" }}
              >
                Docs
              </a>
            </div>
          </div>
        </main>
      </div>
      {/* Partners Section */}
      <div id="partners">
        <Partners />
      </div>
      {/* About Us Section */}
      <div id="mission">
        <AboutUs />
      </div>

      {/* Comparison Section */}
      <Comparison />

      {/* Features Section */}
      <div id="features">
        <Featured />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works">
        <Step />
      </div>

      <Banner />

      {/* Leadership Section */}
      <div id="leadership">
        <Team />
      </div>

      {/* Contact Us Section */}
      <div id="contact-us">
        <NewsLetter />
      </div>
    </div>
  );
}

export default App;
