import { motion } from "framer-motion";
import FeaturedMobile from "./featured-mobile";
import {
  cardHover,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

function Featured() {
  return (
    <>
      {/* Mobile Version */}
      <div className="lg:hidden">
        <FeaturedMobile />
      </div>

      {/* Desktop Version */}
      <section
        className="hidden lg:block w-full bg-[#F7F6FE] py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20 relative overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <img
            src="/feature-background.svg"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
        {/* Background wavy pattern */}
        <div className="absolute inset-0 w-full h-full z-[1] pointer-events-none opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 Q360,150 720,200 T1440,200 L1440,800 L0,800 Z"
              fill="#F3F2FD"
            />
            <path
              d="M0,300 Q360,250 720,300 T1440,300 L1440,800 L0,800 Z"
              fill="#E8E5FF"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="max-w-[1280px] mx-auto relative z-[2]">
          {/* Header Section */}
          <motion.div
            className="flex flex-col items-center gap-4 mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.25, ease: "linear" }}
          >
            <motion.h2
              className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px]
            font-semibold leading-[1.2] text-center
            text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              Built to Handle Your Savings With Care
            </motion.h2>
            <motion.p
              className="text-base lg:text-lg font-normal leading-6 lg:leading-7 text-center
            text-[#4D4D4D] max-w-[820px]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              A professional, end-to-end approach built to grow your savings
              smartly and responsibly.
            </motion.p>
          </motion.div>

          {/* Cards Grid - 2x2 */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-20px" }}
          >
            {/* Card 1: Where Your Savings Are Invested */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="h-96 p-[2.2rem] bg-white rounded-3xl  inline-flex flex-col justify-start items-center gap-10 overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-7">
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch text-center justify-start text-zinc-800 text-3xl font-semibold font-['Hanken_Grotesk'] leading-8">
                      Where Your Savings Are Invested
                    </div>
                    <div className="self-stretch text-center justify-start text-neutral-600 text-base font-normal font-['Hanken_Grotesk'] leading-6">
                      A diversified basket of most trusted yield-bearing assets,
                      selected for maturity, scale, and institutional adoption,
                      designed to deliver consistent, stable returns.
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex-1 relative">
                  <div className="w-52 h-40 px-5 py-4 left-0 top-0 absolute bg-gradient-to-b from-white to-indigo-100 rounded-[19px] border-[1.50px] border-violet-800" />
                  <div className="w-52 h-40 left-0 top-0 absolute rounded-[19px]" />
                  <img
                    className="w-12 h-12 left-[47px] top-[95px] absolute"
                    src="/sUSDS_Coin.svg"
                  />
                  <img
                    className="w-12 h-12 left-[80px] top-[95px] absolute"
                    src="/aUSDC.svg"
                  />
                  <img
                    className="w-12 h-12 left-[113px] top-[95px] absolute"
                    src="usdcsign.svg"
                  />
                  <div className="w-40 h-40 left-[25px] top-[51px] absolute rounded-full border-[3px] border-indigo-100" />
                  <div className="left-[15px] top-[16px] absolute text-center justify-start text-black text-base font-medium font-['Hanken_Grotesk'] leading-7">
                    Yield Bearing Stablecoins
                  </div>
                  <div className="w-52 h-40 px-5 py-4 left-[225px] top-0 absolute bg-gradient-to-b from-white to-indigo-100 rounded-[19px] border-[1.50px] border-violet-800" />
                  <div className="w-52 h-40 left-[225px] top-0 absolute rounded-[19px]" />
                  <div className="w-12 h-12 left-[288px] top-[94px] absolute bg-indigo-100 rounded-full border-2 border-stone-300" />
                  <img
                    className="w-12 h-12 left-[288px] top-[94px] absolute"
                    src="/sUSDS_Coin1.svg"
                  />
                  <img
                    className="w-12 h-12 left-[321px] top-[94px] absolute"
                    src="/ondo.svg"
                  />
                  <div className="w-40 h-40 left-[250px] top-[51px] absolute rounded-full border-[3px] border-indigo-100" />
                  <div className="left-[266px] top-[16px] absolute text-center justify-start text-black text-base font-medium font-['Hanken_Grotesk'] leading-7">
                    Real World Assets
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Why You Earn Better Rates with BOUND */}
            <motion.div
              className="lg:col-span-3 bg-white rounded-2xl lg:rounded-3xl  shadow-sm border border-[#E5EAF2]"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-[733px] h-[400px] p-10 bg-white rounded-3xl  inline-flex flex-col justify-start items-center gap-10 overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-7">
                  <div className="self-stretch flex flex-col justify-start items-center gap-3">
                    <div className="self-stretch text-center justify-start text-[#272727] text-[28px] font-semibold font-['Hanken_Grotesk'] leading-[33.60px]">
                      Why You Earn Better Rates with BOUND
                    </div>
                    <div className="w-[560px] text-center justify-start text-[#4c4c4c] text-base font-normal font-['Hanken_Grotesk'] leading-6">
                      Returns enhanced through professionally built investment
                      strategies managed by institutional asset managers.
                    </div>
                  </div>
                  <div className="w-[653px] h-[162px] relative">
                    <div className="w-[450px] h-[100.80px] px-[19.20px] py-[16.80px] left-[202px] top-[-13px] absolute bg-white rounded-[19.20px] outline outline-[1.20px] outline-offset-[-1.20px] outline-[#130d50] inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-[19.20px]">
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="justify-start text-[#272727] text-2xl font-normal font-['Hanken_Grotesk'] leading-[34.60px]">
                            Lending activities
                          </div>
                        </div>
                      </div>
                      <div data-svg-wrapper>
                        <img src="/rate1.svg" alt="" />
                      </div>
                      <div className="inline-flex flex-col justify-center items-end">
                        <div className="w-[109.20px] text-right justify-start text-[#272727] text-xl font-normal font-['Hanken_Grotesk'] leading-[28.80px]">
                          $513,676.76{" "}
                        </div>
                        <div className="justify-start text-[#a8a8a8] text-lg font-normal font-['Hanken_Grotesk'] leading-6">
                          +8.18%
                        </div>
                      </div>
                    </div>
                    <div className="w-[540px] h-[120.96px] px-[23.04px] py-[20.16px] left-[-2px] top-[54px] absolute bg-white rounded-[23.04px] outline outline-[1.20px] outline-offset-[-1.20px] outline-[#130d50] inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-[23.04px]">
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="justify-start text-[#272727] text-2xl font-normal font-['Hanken_Grotesk'] leading-[34.56px]">
                            Liquidity provision
                          </div>
                        </div>
                      </div>
                      <div data-svg-wrapper>
                        <img src="/rate2.svg" alt="" />
                      </div>
                      <div className="inline-flex flex-col justify-center items-end">
                        <div className="w-[131.04px] text-right justify-start text-[#272727] text-2xl font-normal font-['Hanken_Grotesk'] leading-[34.56px]">
                          $280,561.24{" "}
                        </div>
                        <div className="justify-start text-[#a8a8a8] text-[21.60px] font-normal font-['Hanken_Grotesk'] leading-[28.80px]">
                          +5.13
                        </div>
                      </div>
                    </div>
                    <div className="w-[540px] h-[120.96px] px-[23.04px] py-[20.16px] left-[62.72px] top-[126px] absolute bg-white rounded-[23.04px] shadow-[-17.280000686645508px_-11.520000457763672px_28.80000114440918px_0px_rgba(19,13,80,0.15)] outline outline-[1.20px] outline-offset-[-1.20px] outline-[#130d50] inline-flex justify-between items-center">
                      <div className="flex justify-start items-center gap-[23.04px]">
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="justify-start text-[#272727] text-2xl font-normal font-['Hanken_Grotesk'] leading-[34.56px]">
                            {" "}
                            Arbitrage
                          </div>
                        </div>
                      </div>
                      <div data-svg-wrapper>
                        <img src="/rate3.svg" alt="" />
                      </div>
                      <div className="inline-flex flex-col justify-center items-end">
                        <div className="justify-start text-[#272727] text-2xl font-normal font-['Hanken_Grotesk'] leading-[34.56px]">
                          $429,850.15{" "}
                        </div>
                        <div className="justify-start text-[#a8a8a8] text-[21.60px] font-normal font-['Hanken_Grotesk'] leading-[28.80px]">
                          +6.43%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: How Your Savings Are Managed */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2]"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="h-[25rem] p-10 bg-white rounded-3xl  inline-flex flex-col justify-start items-center gap-10 overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-7">
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch text-center justify-start text-[#272727] text-[28px] font-semibold font-['Hanken_Grotesk'] leading-[33.60px]">
                      How Your Savings Are Managed
                    </div>
                    <div className="self-stretch text-center justify-start text-[#4c4c4c] text-base font-normal font-['Hanken_Grotesk'] leading-6">
                      Our team of professional managers continuously monitors
                      performance, evaluates risk, and rebalances allocations to
                      keep the portfolio aligned with best-in-class results.
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex-1 relative">
                  <div className="w-96 h-72 relative bg-white rounded-[20px] shadow-[0px_-4px_20px_0px_rgba(19,13,80,0.15)] outline outline-1 outline-offset-[-1px] outline-indigo-950 overflow-hidden">
                    <div
                      data-svg-wrapper
                      className="left-[-103px] top-[44.73px] absolute"
                    >
                      <svg
                        width="450"
                        height="1"
                        viewBox="0 0 450 1"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M-103 0.16748H450"
                          stroke="#E3E6FF"
                          stroke-width="0.335165"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[-103px] top-[97.30px] absolute"
                    >
                      <svg
                        width="450"
                        height="1"
                        viewBox="0 0 450 1"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M-103 0.16748H450"
                          stroke="#E3E6FF"
                          stroke-width="0.335165"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[-103px] top-[149.86px] absolute"
                    >
                      <svg
                        width="450"
                        height="1"
                        viewBox="0 0 450 1"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M-103 0.16748H450"
                          stroke="#E3E6FF"
                          stroke-width="0.335165"
                        />
                      </svg>
                    </div>
                    <div className="w-[553px] h-0 left-[-103px] top-[202.43px] absolute outline outline-[0.34px] outline-offset-[-0.17px] outline-indigo-100" />
                    <div className="w-[553px] h-0 left-[-103px] top-[255px] absolute outline outline-[0.34px] outline-offset-[-0.17px] outline-indigo-100" />
                    <div
                      data-svg-wrapper
                      className="left-[441.56px] top-[58.38px] absolute"
                    >
                      <svg
                        width="1"
                        height="49"
                        viewBox="0 0 1 49"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434753 0V48.4878"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[441.56px] top-[70.89px] absolute"
                    >
                      <svg
                        width="7"
                        height="22"
                        viewBox="0 0 7 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V21.395"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[423.47px] top-[65.34px] absolute"
                    >
                      <svg
                        width="1"
                        height="58"
                        viewBox="0 0 1 58"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434753 0V57.6973"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[423.47px] top-[80.51px] absolute"
                    >
                      <svg
                        width="7"
                        height="35"
                        viewBox="0 0 7 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V34.3138"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[405.36px] top-[55.15px] absolute"
                    >
                      <svg
                        width="1"
                        height="51"
                        viewBox="0 0 1 51"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434753 0V50.2225"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[405.36px] top-[66.92px] absolute"
                    >
                      <svg
                        width="7"
                        height="29"
                        viewBox="0 0 7 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V28.5172"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[387.27px] top-[35px] absolute"
                    >
                      <svg
                        width="1"
                        height="61"
                        viewBox="0 0 1 61"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V60.1796"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[387.27px] top-[46.69px] absolute"
                    >
                      <svg
                        width="7"
                        height="38"
                        viewBox="0 0 7 38"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V37.7973"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[369.18px] top-[63.46px] absolute"
                    >
                      <svg
                        width="1"
                        height="48"
                        viewBox="0 0 1 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V47.7544"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[369.18px] top-[74.90px] absolute"
                    >
                      <svg
                        width="7"
                        height="24"
                        viewBox="0 0 7 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V23.1297"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[351.06px] top-[83.01px] absolute"
                    >
                      <svg
                        width="1"
                        height="48"
                        viewBox="0 0 1 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V47.9941"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[351.06px] top-[98.17px] absolute"
                    >
                      <svg
                        width="7"
                        height="18"
                        viewBox="0 0 7 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V17.6576"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[332.98px] top-[70.57px] absolute"
                    >
                      <svg
                        width="1"
                        height="49"
                        viewBox="0 0 1 49"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V48.9955"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[332.98px] top-[85.74px] absolute"
                    >
                      <svg
                        width="7"
                        height="19"
                        viewBox="0 0 7 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V18.4756"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[314.88px] top-[83.01px] absolute"
                    >
                      <svg
                        width="1"
                        height="60"
                        viewBox="0 0 1 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V59.4321"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[314.88px] top-[98.17px] absolute"
                    >
                      <svg
                        width="7"
                        height="35"
                        viewBox="0 0 7 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V34.3279"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[296.77px] top-[83.01px] absolute"
                    >
                      <svg
                        width="1"
                        height="42"
                        viewBox="0 0 1 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V41.154"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[296.77px] top-[98.17px] absolute"
                    >
                      <svg
                        width="7"
                        height="17"
                        viewBox="0 0 7 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V16.7549"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[278.68px] top-[76.54px] absolute"
                    >
                      <svg
                        width="1"
                        height="44"
                        viewBox="0 0 1 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V43.0297"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[278.68px] top-[91.71px] absolute"
                    >
                      <svg
                        width="7"
                        height="13"
                        viewBox="0 0 7 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V12.5098"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[260.57px] top-[83.01px] absolute"
                    >
                      <svg
                        width="1"
                        height="83"
                        viewBox="0 0 1 83"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V82.3079"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[260.57px] top-[98.17px] absolute"
                    >
                      <svg
                        width="7"
                        height="59"
                        viewBox="0 0 7 59"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V58.191"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[242.48px] top-[106.14px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[242.48px] top-[121.30px] absolute"
                    >
                      <svg
                        width="7"
                        height="35"
                        viewBox="0 0 7 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V34.3138"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[224.39px] top-[108.87px] absolute"
                    >
                      <svg
                        width="1"
                        height="74"
                        viewBox="0 0 1 74"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V73.6061"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[224.39px] top-[122.79px] absolute"
                    >
                      <svg
                        width="7"
                        height="45"
                        viewBox="0 0 7 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V44.5106"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[206.28px] top-[151.14px] absolute"
                    >
                      <svg
                        width="1"
                        height="51"
                        viewBox="0 0 1 51"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V59.6859"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[206.28px] top-[161.34px] absolute"
                    >
                      <svg
                        width="7"
                        height="35"
                        viewBox="0 0 7 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V34.3138"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[188.19px] top-[93.64px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[188.19px] top-[108.80px] absolute"
                    >
                      <svg
                        width="7"
                        height="43"
                        viewBox="0 0 7 43"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V42.2822"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[170.10px] top-[98.92px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6645"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[170.10px] top-[123.29px] absolute"
                    >
                      <svg
                        width="7"
                        height="26"
                        viewBox="0 0 7 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V25.1183"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[151.99px] top-[123.29px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[151.99px] top-[150.89px] absolute"
                    >
                      <svg
                        width="7"
                        height="22"
                        viewBox="0 0 7 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.47809 0V21.8886"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[133.90px] top-[138.46px] absolute"
                    >
                      <svg
                        width="1"
                        height="64"
                        viewBox="0 0 1 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[133.90px] top-[170.79px] absolute"
                    >
                      <svg
                        width="7"
                        height="18"
                        viewBox="0 0 7 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V17.1498"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[115.81px] top-[129.51px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[115.81px] top-[158.11px] absolute"
                    >
                      <svg
                        width="7"
                        height="21"
                        viewBox="0 0 7 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V20.8873"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[97.70px] top-[123.29px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[97.70px] top-[146.67px] absolute"
                    >
                      <svg
                        width="7"
                        height="27"
                        viewBox="0 0 7 27"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V26.1055"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[79.61px] top-[139.22px] absolute"
                    >
                      <svg
                        width="1"
                        height="63"
                        viewBox="0 0 1 63"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[79.61px] top-[148.42px] absolute"
                    >
                      <svg
                        width="7"
                        height="41"
                        viewBox="0 0 7 41"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V40.2936"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[61.51px] top-[112.33px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[61.51px] top-[127.50px] absolute"
                    >
                      <svg
                        width="7"
                        height="40"
                        viewBox="0 0 7 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V39.0384"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[43.41px] top-[85.73px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[43.41px] top-[100.91px] absolute"
                    >
                      <svg
                        width="7"
                        height="40"
                        viewBox="0 0 7 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V39.5321"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[25.31px] top-[96.67px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434784 0V64.6504"
                          stroke="#130D50"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[25.31px] top-[107.62px] absolute"
                    >
                      <svg
                        width="7"
                        height="39"
                        viewBox="0 0 7 39"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V38.5448"
                          stroke="#130D50"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[7.22px] top-[83.26px] absolute"
                    >
                      <svg
                        width="1"
                        height="65"
                        viewBox="0 0 1 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.434776 0V64.6504"
                          stroke="#B3B6FF"
                          stroke-width="0.869553"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[7.22px] top-[98.42px] absolute"
                    >
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.4781 0V10.6904"
                          stroke="#B3B6FF"
                          stroke-width="6.9562"
                          stroke-miterlimit="10"
                        />
                      </svg>
                    </div>
                    <div className="w-0 h-16 left-[-10.89px] top-[68.58px] absolute outline outline-[0.87px] outline-offset-[-0.43px] outline-indigo-950" />
                    <div className="w-0 h-4 left-[-10.89px] top-[83.76px] absolute outline outline-[6.96px] outline-offset-[-3.48px] outline-indigo-950" />
                    <div className="w-0 h-20 left-[-29.12px] top-[99.93px] absolute outline outline-[0.87px] outline-offset-[-0.43px] outline-indigo-300" />
                    <div className="w-0 h-14 left-[-29.12px] top-[108.60px] absolute outline outline-[6.96px] outline-offset-[-3.48px] outline-indigo-300" />
                    <div className="w-0 h-16 left-[-46.79px] top-[143.25px] absolute outline outline-[0.87px] outline-offset-[-0.43px] outline-indigo-950" />
                    <div className="w-0 h-8 left-[-46.79px] top-[126.79px] absolute outline outline-[6.96px] outline-offset-[-3.48px] outline-indigo-950" />
                    <div className="w-0 h-16 left-[-65.39px] top-[139.79px] absolute outline outline-[0.87px] outline-offset-[-0.43px] outline-indigo-300" />
                    <div className="w-0 h-10 left-[-65.39px] top-[150.18px] absolute outline outline-[6.96px] outline-offset-[-3.48px] outline-indigo-300" />
                    <div
                      data-svg-wrapper
                      className="left-[25px] top-[14px] absolute"
                    >
                      <svg
                        width="50"
                        height="46"
                        viewBox="0 0 50 46"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          opacity="0.1"
                          width="50"
                          height="46"
                          rx="8"
                          fill="#130D50"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[29px] top-[16px] absolute"
                    >
                      <img src="/new-file.svg" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: How Your Funds Are Protected */}
            <motion.div
              className="lg:col-span-3 bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] shadow-[0px_8px_60px_0px_rgba(19,13,80,0.30)] outline outline-2 outline-offset-[-2px] outline-[#130d50]"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-[100%] h-[400px] p-10 bg-gradient-to-b from-white to-[#e0e2ff] rounded-3xl  inline-flex flex-col justify-center items-start gap-5 overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start gap-7">
                  <div className="self-stretch flex flex-col justify-start items-center gap-3">
                    <div className="self-stretch text-center justify-start text-[#272727] text-[28px] font-semibold font-['Hanken_Grotesk'] leading-[33.60px]">
                      How Your Funds Are Protected
                    </div>
                    <div className="w-[560px] text-center justify-start text-[#4c4c4c] text-base font-normal font-['Hanken_Grotesk'] leading-6">
                      {" "}
                      Your funds remain fully transparent and always under your
                      control. All underlying strategies are built on
                      established, battle-tested infrastructure securing
                      trillions of dollars in assets.
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex-1 relative">
                  <div className="w-[9px] h-[241px] left-[5px] top-[-11px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[111px] top-[49px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[226px] top-[32px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[391px] top-[41px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[528px] top-[32px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[467px] top-[149px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[592px] top-[145px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[320px] top-[149px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[176px] top-[156px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[56px] top-[150px] absolute bg-white" />
                  <div className="w-[9px] h-[241px] left-[626px] top-[29px] absolute bg-white" />
                  <div className="p-2 left-[496px] top-[40.50px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                    <div className="w-[85px] h-[85px] relative">
                      <div data-svg-wrapper className="left-0 top-0 absolute">
                        <svg
                          width="85"
                          height="85"
                          viewBox="0 0 85 85"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M83.7189 52.781C78.0427 75.549 54.9824 89.4053 32.2116 83.7276C9.45035 78.0514 -4.40586 54.9896 1.27281 32.2234C6.9465 9.45281 30.0069 -4.40444 52.7706 1.27175C75.5397 6.94793 89.3951 30.0122 83.7183 52.7814L83.7187 52.781H83.7189Z"
                            fill="#130D50"
                          />
                        </svg>
                      </div>
                      <div
                        data-svg-wrapper
                        className="left-[13px] top-[12.50px] absolute"
                      >
                        <img src="/new-file1.svg" alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 left-[85px] top-[40.50px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                    <div className="w-[85px] h-[85px] relative">
                      <div className="w-[85px] h-[85px] left-0 top-0 absolute bg-[#130d50] rounded-full" />
                      <img
                        className="w-[86px] h-[86px] left-0 top-[-0.50px] absolute"
                        src="/new-file5.svg"
                      />
                    </div>
                  </div>
                  <div className="p-2 left-[359px] top-[40.50px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                    <div className="w-[85px] h-[85px] relative">
                      <div data-svg-wrapper className="left-0 top-0 absolute">
                        <svg
                          width="85"
                          height="85"
                          viewBox="0 0 85 85"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M83.7189 52.781C78.0427 75.549 54.9824 89.4053 32.2116 83.7276C9.45035 78.0514 -4.40586 54.9896 1.27281 32.2234C6.9465 9.45281 30.0069 -4.40444 52.7706 1.27175C75.5397 6.94793 89.3951 30.0122 83.7183 52.7814L83.7187 52.781H83.7189Z"
                            fill="#130D50"
                          />
                        </svg>
                      </div>
                      <div
                        data-svg-wrapper
                        className="left-[16px] top-[17.50px] absolute"
                      >
                        <img src="/new-file2.svg" alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 left-[222px] top-[40.50px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                    <div className="w-[85px] h-[85px] relative">
                      <div className="w-[85px] h-[85px] left-0 top-0 absolute bg-[#130d50] rounded-full" />
                      <div
                        data-svg-wrapper
                        className="left-[16px] top-[15.50px] absolute"
                      >
                        <img src="/new-file4.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Featured;
