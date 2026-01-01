function AboutUs() {
  return (
    <section className="w-full bg-white py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Mobile Background Image */}
        <img
          src="/background-about-mobile.svg"
          alt=""
          className="block lg:hidden w-full h-full object-cover object-center opacity-100"
          aria-hidden="true"
          loading="lazy"
        />
        {/* Desktop Background Image */}
        <img
          src="/background-about.svg"
          alt=""
          className="hidden lg:block w-full h-full object-cover object-center opacity-100"
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            bottom: "-313px",
          }}
          loading="lazy"
        />
      </div>

      <div className="max-w-[1280px] mx-auto relative z-[2]">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-28">
          {/* Image Section - Top on mobile, left on desktop */}
          <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-1">
            <div className="relative w-full max-w-[384px] mx-auto lg:mx-0">
              <div className="w-full">
                <img
                  className="w-full h-full object-cover"
                  src="/about-Image.png"
                  alt="About BOUND Protocol"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Content Section - Below image on mobile, right on desktop */}
          <div className="w-full lg:w-auto lg:flex-1 max-w-[628px] order-2 lg:order-2">
            <div className="flex flex-col gap-6 lg:gap-9 text-left">
              {/* Heading */}
              <h2
                className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px]
                font-semibold leading-[1.2] lg:leading-[1.2]
                text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px]"
              >
                We make investing
                <br />
                simple
              </h2>

              {/* Description */}
              <p
                className="text-base lg:text-base font-normal leading-[1.6] lg:leading-6
                text-[#4D4D4D] max-w-full lg:max-w-[593px]"
              >
                Everything we do is built around simplicity. We designed a
                savings app that simplifies investing and meets real needs.
                Behind that simplicity is a responsible approach to growing your
                savings passively, handled by experienced professionals.
              </p>

              {/* CTA Button */}
              <div className="flex justify-start mt-2 w-full lg:w-auto">
                <button
                  className="btn-base bg-[#6D5EED] text-white 
                  px-6 py-3.5 lg:px-7 lg:py-4
                  text-base font-bold rounded-xl
                  w-full lg:w-auto"
                >
                  Start Earning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
