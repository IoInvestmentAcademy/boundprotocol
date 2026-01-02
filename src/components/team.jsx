function Team() {
  return (
    <section className="w-full py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20 relative overflow-hidden bg-[#F7F6FE]">
      {/* Background image */}
      {/* <div
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        style={{ contain: "layout style paint", willChange: "auto" }}
      >
        <img
          src="/team-background.svg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          style={{ willChange: "auto", backfaceVisibility: "hidden" }}
        />
      </div> */}

      <div className="max-w-[1280px] mx-auto relative z-[2]">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-12 lg:mb-16">
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px] font-semibold leading-[1.2] text-center text-zinc-800 font-['Hanken_Grotesk'] tracking-[-0.5px] lg:tracking-[-1px]">
            Team Presentation
          </h2>
          <p className="text-base lg:text-lg font-normal leading-6 lg:leading-7 text-center text-neutral-400 font-['Hanken_Grotesk'] max-w-[838px]">
            Our team and partners is a blend of innovative thinkers, experienced
            investors, and blockchain enthusiasts united by a common mission: to
            redefine the way the world invests. Together, we're creating a
            secure, transparent, and scalable platform that empowers users to
            achieve their financial goals.
          </p>
        </div>
        {/* Team Image Section */}
        <div className="w-full mb-12 lg:mb-16 flex justify-center">
          <div className="w-full max-w-[1136px] h-auto lg:h-[700px] relative">
            <div
              className="w-full h-[400px] lg:h-[650px] relative bg-neutral-200 rounded-[20px] overflow-hidden"
              style={{ contain: "layout style paint" }}
            >
              <img
                className="w-full h-full object-cover"
                src="/team-video-image.png"
                alt="Team presentation"
                loading="lazy"
                decoding="async"
                style={{ willChange: "auto", backfaceVisibility: "hidden" }}
              />
              <div
                className="w-24 h-24 lg:w-32 lg:h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-white/40 rounded-full border-4 border-zinc-500 cursor-pointer"
                style={{
                  willChange: "auto",
                  backfaceVisibility: "hidden",
                  transform: "translate(-50%, -50%) translateZ(0)",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <img
                  src="/play-video.svg"
                  alt="Play icon"
                  loading="lazy"
                  decoding="async"
                  style={{ willChange: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Members Section */}
        <div className="flex flex-col items-center gap-10">
          <h3 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px] font-semibold leading-[1.2] text-center text-zinc-800 font-['Hanken_Grotesk'] tracking-[-0.5px] lg:tracking-[-1px]">
            Executive Members
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 w-full max-w-[1200px]">
            {/* Member 1 */}
            <div
              className="flex flex-col items-center gap-5"
              style={{ contain: "layout style paint" }}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/george.png"
                  alt="Georgian Ionita"
                  loading="lazy"
                  decoding="async"
                  style={{ willChange: "auto", backfaceVisibility: "hidden" }}
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
                  <a
                    href="https://www.linkedin.com/in/georgian-ioni%C8%9B%C4%83-ab994b242/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 0C9.85159 0 0 9.85159 0 22C0 34.1484 9.85159 44 22 44C34.1484 44 44 34.1484 44 22C44 9.85159 34.1484 0 22 0ZM15.6071 33.2578H10.2491V17.1382H15.6071V33.2578ZM12.9282 14.937H12.8933C11.0953 14.937 9.9325 13.6993 9.9325 12.1524C9.9325 10.5706 11.1309 9.36719 12.9638 9.36719C14.7967 9.36719 15.9246 10.5706 15.9595 12.1524C15.9595 13.6993 14.7967 14.937 12.9282 14.937ZM34.9269 33.2578H29.5696V24.6342C29.5696 22.4669 28.7938 20.9889 26.8551 20.9889C25.3751 20.9889 24.4935 21.9859 24.1061 22.9483C23.9645 23.2928 23.9299 23.7741 23.9299 24.2559V33.2578H18.5722C18.5722 33.2578 18.6424 18.6505 18.5722 17.1382H23.9299V19.4205C24.6419 18.3221 25.9159 16.7598 28.7585 16.7598C32.2836 16.7598 34.9269 19.0637 34.9269 24.0148V33.2578Z"
                        fill="#CBCBCB"
                      />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-center text-zinc-800 text-xl font-semibold font-['Hanken_Grotesk'] leading-7">
                  Georgian Ionita
                </div>
                <div className="text-center text-neutral-400 text-base font-medium font-['Hanken_Grotesk'] leading-6">
                  CEO BOUND Protocol
                </div>
              </div>
            </div>
            {/* Member 2 */}
            <div
              className="flex flex-col items-center gap-5"
              style={{ contain: "layout style paint" }}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/joshua.png"
                  alt="Joshua Oloma"
                  loading="lazy"
                  decoding="async"
                  style={{ willChange: "auto", backfaceVisibility: "hidden" }}
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
                  <a
                    href="https://www.linkedin.com/in/joshua-oloma-8a7319105/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 0C9.85159 0 0 9.85159 0 22C0 34.1484 9.85159 44 22 44C34.1484 44 44 34.1484 44 22C44 9.85159 34.1484 0 22 0ZM15.6071 33.2578H10.2491V17.1382H15.6071V33.2578ZM12.9282 14.937H12.8933C11.0953 14.937 9.9325 13.6993 9.9325 12.1524C9.9325 10.5706 11.1309 9.36719 12.9638 9.36719C14.7967 9.36719 15.9246 10.5706 15.9595 12.1524C15.9595 13.6993 14.7967 14.937 12.9282 14.937ZM34.9269 33.2578H29.5696V24.6342C29.5696 22.4669 28.7938 20.9889 26.8551 20.9889C25.3751 20.9889 24.4935 21.9859 24.1061 22.9483C23.9645 23.2928 23.9299 23.7741 23.9299 24.2559V33.2578H18.5722C18.5722 33.2578 18.6424 18.6505 18.5722 17.1382H23.9299V19.4205C24.6419 18.3221 25.9159 16.7598 28.7585 16.7598C32.2836 16.7598 34.9269 19.0637 34.9269 24.0148V33.2578Z"
                        fill="#CBCBCB"
                      />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-center text-zinc-800 text-xl font-semibold font-['Hanken_Grotesk'] leading-7">
                  Joshua Oloma
                </div>
                <div className="text-center text-neutral-400 text-base font-medium font-['Hanken_Grotesk'] leading-6">
                  CTO BOUND Protocol
                </div>
              </div>
            </div>
            {/* Member 3 */}
            <div
              className="flex flex-col items-center gap-5"
              style={{ contain: "layout style paint" }}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/monalisa.png"
                  alt="Mona El Isa"
                  loading="lazy"
                  decoding="async"
                  style={{ willChange: "auto", backfaceVisibility: "hidden" }}
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
                  <a
                    href="https://www.linkedin.com/in/monaelisa/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 0C9.85159 0 0 9.85159 0 22C0 34.1484 9.85159 44 22 44C34.1484 44 44 34.1484 44 22C44 9.85159 34.1484 0 22 0ZM15.6071 33.2578H10.2491V17.1382H15.6071V33.2578ZM12.9282 14.937H12.8933C11.0953 14.937 9.9325 13.6993 9.9325 12.1524C9.9325 10.5706 11.1309 9.36719 12.9638 9.36719C14.7967 9.36719 15.9246 10.5706 15.9595 12.1524C15.9595 13.6993 14.7967 14.937 12.9282 14.937ZM34.9269 33.2578H29.5696V24.6342C29.5696 22.4669 28.7938 20.9889 26.8551 20.9889C25.3751 20.9889 24.4935 21.9859 24.1061 22.9483C23.9645 23.2928 23.9299 23.7741 23.9299 24.2559V33.2578H18.5722C18.5722 33.2578 18.6424 18.6505 18.5722 17.1382H23.9299V19.4205C24.6419 18.3221 25.9159 16.7598 28.7585 16.7598C32.2836 16.7598 34.9269 19.0637 34.9269 24.0148V33.2578Z"
                        fill="#CBCBCB"
                      />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-center text-zinc-800 text-xl font-semibold font-['Hanken_Grotesk'] leading-7">
                  Mona El Isa
                </div>
                <div className="text-center text-neutral-400 text-base font-medium font-['Hanken_Grotesk'] leading-6">
                  CEO Avantgarde Asset Management Partner
                </div>
              </div>
            </div>
            {/* Member 4 */}
            <div
              className="flex flex-col items-center gap-5"
              style={{ contain: "layout style paint" }}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/frances.png"
                  alt="Frances Edwards"
                  loading="lazy"
                  decoding="async"
                  style={{ willChange: "auto", backfaceVisibility: "hidden" }}
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
                  <a
                    href="https://www.linkedin.com/in/francesedwards/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      width="44"
                      height="44"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 0C9.85159 0 0 9.85159 0 22C0 34.1484 9.85159 44 22 44C34.1484 44 44 34.1484 44 22C44 9.85159 34.1484 0 22 0ZM15.6071 33.2578H10.2491V17.1382H15.6071V33.2578ZM12.9282 14.937H12.8933C11.0953 14.937 9.9325 13.6993 9.9325 12.1524C9.9325 10.5706 11.1309 9.36719 12.9638 9.36719C14.7967 9.36719 15.9246 10.5706 15.9595 12.1524C15.9595 13.6993 14.7967 14.937 12.9282 14.937ZM34.9269 33.2578H29.5696V24.6342C29.5696 22.4669 28.7938 20.9889 26.8551 20.9889C25.3751 20.9889 24.4935 21.9859 24.1061 22.9483C23.9645 23.2928 23.9299 23.7741 23.9299 24.2559V33.2578H18.5722C18.5722 33.2578 18.6424 18.6505 18.5722 17.1382H23.9299V19.4205C24.6419 18.3221 25.9159 16.7598 28.7585 16.7598C32.2836 16.7598 34.9269 19.0637 34.9269 24.0148V33.2578Z"
                        fill="#CBCBCB"
                      />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-center text-zinc-800 text-xl font-semibold font-['Hanken_Grotesk'] leading-7">
                  Frances Edwards
                </div>
                <div className="text-center text-neutral-400 text-base font-medium font-['Hanken_Grotesk'] leading-6">
                  COO Avantgarde Asset Management Partner
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Team;
