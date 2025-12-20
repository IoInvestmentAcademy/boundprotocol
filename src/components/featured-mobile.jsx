function FeaturedMobile() {
  return (
    <section className="w-full bg-[#F7F6FE] py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20 relative overflow-hidden">
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
        <div className="flex flex-col items-center gap-4 mb-8 lg:mb-16">
          <h2
            className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[48px] xl:text-[57px]
              font-semibold leading-[1.2] text-center
              text-[#1a1a1a] tracking-[-0.5px] lg:tracking-[-1px] px-2"
          >
            Built to Handle Your Savings With Care
          </h2>
          <p
            className="text-sm lg:text-lg font-normal leading-5 lg:leading-7 text-center
              text-[#4D4D4D] max-w-full lg:max-w-[820px] px-4"
          >
            A professional, end-to-end approach built to grow your savings
            smartly and responsibly.
          </p>
        </div>

        {/* Cards Grid - Mobile: Single column, Desktop: 2x2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8">
          {/* Card 1: Where Your Savings Are Invested */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] lg:col-span-2">
            <div className=" h-60 p-4 bg-white rounded-xl shadow-[0px_7.705320835113525px_9.631650924682617px_0px_rgba(96,51,255,0.20)] outline outline-1 outline-offset-[-0.96px] inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <div className="self-stretch text-center justify-start text-zinc-800 text-base font-semibold font-['Hanken_Grotesk'] leading-5">
                  Where Your Savings Are Invested
                </div>
                <div className="self-stretch text-center justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                  A diversified basket of top tier yield-bearing assets,
                  selected for maturity, scale, and institutional adoption,
                  designed to deliver consistent, stable returns.
                </div>
              </div>
              <div className="self-stretch flex-1 relative">
                <img
                  className="w-80 h-28 left-0 top-[-11px] absolute"
                  src="/Content 1.svg"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Why You Earn Better Rates with BOUND */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] lg:col-span-3">
            <div className="h-60 p-4 relative bg-white rounded-xl shadow-[0px_7.705320835113525px_9.631650924682617px_0px_rgba(96,51,255,0.20)] outline outline-1 outline-offset-[-0.96px] inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <div className="self-stretch text-center justify-start text-zinc-800 text-base font-semibold font-['Hanken_Grotesk'] leading-5">
                  Why You Earn Better Rates with BOUND
                </div>
                <div className="self-stretch text-center justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                  Returns enhanced through professionally built investment
                  strategies managed by institutional asset managers.
                </div>
              </div>
              <div className="w-80 h-32 left-[16px] top-[107px] absolute">
                <div className="w-56 h-12 px-2.5 py-2 left-[100.47px] top-[-8px] absolute bg-white rounded-lg outline outline-[0.59px] outline-offset-[-0.59px] outline-indigo-950 inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="inline-flex flex-col justify-center items-start">
                      <div className="justify-start text-zinc-800 text-[10px] font-normal font-['Hanken_Grotesk'] leading-4">
                        Lending activities
                      </div>
                    </div>
                  </div>
                  <img className="w-14 h-7" src="/rate1.svg" alt="" />

                  <div className="inline-flex flex-col justify-center items-end">
                    <div className="w-14 text-right justify-start text-zinc-800 text-[10px] font-normal font-['Hanken_Grotesk'] leading-4">
                      $513,676.76{" "}
                    </div>
                    <div className="justify-start text-neutral-400 text-[8.82px] font-normal font-['Hanken_Grotesk'] leading-3">
                      +8.18%
                    </div>
                  </div>
                </div>
                <div className="w-64 h-14 px-3 py-2.5 left-0 top-[26.46px] absolute bg-white rounded-xl outline outline-[0.59px] outline-offset-[-0.59px] outline-indigo-950 inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3">
                    <div className="inline-flex flex-col justify-center items-start">
                      <div className="justify-start text-zinc-800 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                        Liquidity provision
                      </div>
                    </div>
                  </div>
                  <img className="w-14 h-7" src="/rate2.svg" alt="" />

                  <div className="inline-flex flex-col justify-center items-end">
                    <div className="w-16 text-right justify-start text-zinc-800 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                      $280,561.24{" "}
                    </div>
                    <div className="justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                      4.65%
                    </div>
                  </div>
                </div>
                <div className="w-64 h-14 px-3 py-2.5 left-[31.72px] top-[61.75px] absolute bg-white rounded-xl shadow-[-8.46851921081543px_-5.645679473876953px_14.114198684692383px_0px_rgba(19,13,80,0.15)] outline outline-[0.59px] outline-offset-[-0.59px] outline-indigo-950 inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3">
                    <div className="inline-flex flex-col justify-center items-start">
                      <div className="justify-start text-zinc-800 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                        {" "}
                        Arbitrage
                      </div>
                    </div>
                  </div>
                  <img className="w-14 h-7" src="/rate3.svg" alt="" />
                  {/* <div className="w-14 h-7 bg-gradient-to-b from-violet-600/20 to-violet-600/0" />
                  <div className="w-14 h-6 rounded-[0.71px] outline outline-[1.41px] outline-offset-[-0.71px] outline-indigo-950" /> */}
                  <div className="inline-flex flex-col justify-center items-end">
                    <div className="justify-start text-zinc-800 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                      $429,850.15{" "}
                    </div>
                    <div className="justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                      +6.43%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: How Your Savings Are Managed */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] lg:col-span-2">
            <div className=" h-60 p-4 relative bg-white rounded-xl shadow-[0px_2.7417476177215576px_2.7417476177215576px_0px_rgba(0,0,0,0.25)] outline outline-[0.69px] outline-offset-[-0.69px] inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch text-center justify-start text-zinc-800 text-base font-semibold font-['Hanken_Grotesk'] leading-5">
                  How Your Savings Are Managed
                </div>
                <div className="self-stretch text-center justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                  Our team of professional managers continuously monitors
                  performance, evaluates risk, and rebalances allocations to
                  keep the portfolio aligned with best-in-class results.
                </div>
              </div>
              <div className="w-80 h-52 left-[16px] top-[117px] absolute bg-white rounded-2xl shadow-[0px_-2.8533332347869873px_14.266666412353516px_0px_rgba(19,13,80,0.15)] outline outline-[0.71px] outline-offset-[-0.71px] outline-indigo-950 overflow-hidden">
                <div className="w-96 h-0 left-[-73px] top-[32px] absolute outline outline-[0.24px] outline-offset-[-0.12px] outline-indigo-100" />
                <div className="w-96 h-0 left-[-73px] top-[69px] absolute outline outline-[0.24px] outline-offset-[-0.12px] outline-indigo-100" />
                <div className="w-96 h-0 left-[-73px] top-[107px] absolute outline outline-[0.24px] outline-offset-[-0.12px] outline-indigo-100" />
                <div className="w-96 h-0 left-[-73px] top-[144px] absolute outline outline-[0.24px] outline-offset-[-0.12px] outline-indigo-100" />
                <div className="w-96 h-0 left-[-73px] top-[182px] absolute outline outline-[0.24px] outline-offset-[-0.12px] outline-indigo-100" />
                <div className="w-0 h-8 left-[315px] top-[42px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-3.5 left-[315px] top-[51px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-10 left-[302px] top-[47px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-6 left-[302px] top-[57px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-9 left-[289px] top-[39px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-5 left-[289px] top-[48px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[276px] top-[25px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-7 left-[276px] top-[33px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-8 left-[263px] top-[45px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-4 left-[263px] top-[53px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-8 left-[251px] top-[59px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-3 left-[251px] top-[70px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-9 left-[238px] top-[50px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-3 left-[238px] top-[61px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-10 left-[225px] top-[59px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-6 left-[225px] top-[70px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-7 left-[212px] top-[59px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-3 left-[212px] top-[70px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-8 left-[199px] top-[55px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-2 left-[199px] top-[65px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-14 left-[186px] top-[59px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-10 left-[186px] top-[70px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[173px] top-[76px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-6 left-[173px] top-[86px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-12 left-[160px] top-[78px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-8 left-[160px] top-[87px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-10 left-[147px] top-[108px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-6 left-[147px] top-[115px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[135px] top-[67px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-7 left-[135px] top-[77px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[122px] top-[70px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-4 left-[122px] top-[88px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[109px] top-[88px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-4 left-[109px] top-[107px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[96px] top-[99px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-3 left-[96px] top-[122px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[83px] top-[92px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-3.5 left-[83px] top-[113px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[70px] top-[88px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-5 left-[70px] top-[104px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[57px] top-[99px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-7 left-[57px] top-[106px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[44px] top-[80px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-7 left-[44px] top-[91px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[31px] top-[61px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-7 left-[31px] top-[72px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[19px] top-[69px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-7 left-[19px] top-[77px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[6px] top-[59px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-2 left-[6px] top-[70px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[-7px] top-[49px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-3 left-[-7px] top-[60px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-14 left-[-20px] top-[71px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-9 left-[-20px] top-[77px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-0 h-11 left-[-33px] top-[102px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-950" />
                <div className="w-0 h-5 left-[-33px] top-[90px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-950" />
                <div className="w-0 h-11 left-[-46px] top-[99px] absolute outline outline-[0.62px] outline-offset-[-0.31px] outline-indigo-300" />
                <div className="w-0 h-7 left-[-46px] top-[107px] absolute outline outline-[4.96px] outline-offset-[-2.48px] outline-indigo-300" />
                <div className="w-10 h-9 left-[12px] top-[11px] absolute opacity-10 bg-indigo-950 rounded-lg" />
                <img
                  className="w-8 h-8 left-[15.04px] top-[12.52px] absolute"
                  src="/new-file.svg"
                />
              </div>
            </div>
          </div>

          {/* Card 4: How Your Funds Are Protected */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#E5EAF2] shadow-[0px_8px_60px_0px_rgba(19,13,80,0.30)] outline outline-2 outline-offset-[-2px] outline-[#130d50] lg:col-span-3">
            <div className="h-60 p-4 relative bg-gradient-to-b from-white to-indigo-100 rounded-xl shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] outline outline-[0.69px] outline-offset-[-0.69px] outline-indigo-950 inline-flex flex-col justify-start items-center gap-5 overflow-hidden">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch text-center justify-start text-zinc-800 text-base font-semibold font-['Hanken_Grotesk'] leading-5">
                  How Your Funds Are Protected
                </div>
                <div className="self-stretch text-center justify-start text-neutral-400 text-xs font-normal font-['Hanken_Grotesk'] leading-4">
                  {" "}
                  Your funds remain fully transparent and always under your
                  control. All underlying strategies are built on established,
                  battle-tested infrastructure securing trillions of dollars in
                  assets.
                </div>
              </div>
              <div className="w-80 h-24 left-[16px] top-[131px] absolute">
                <div className="w-1 h-28 left-[2.46px] top-[-5.41px] absolute bg-white" />
                <div className="w-1 h-28 left-[54.57px] top-[24.09px] absolute bg-white" />
                <div className="w-1 h-28 left-[111.10px] top-[15.73px] absolute bg-white" />
                <div className="w-1 h-28 left-[192.21px] top-[20.16px] absolute bg-white" />
                <div className="w-1 h-28 left-[259.55px] top-[15.73px] absolute bg-white" />
                <div className="w-1 h-28 left-[229.57px] top-[73.25px] absolute bg-white" />
                <div className="w-1 h-28 left-[291.01px] top-[71.28px] absolute bg-white" />
                <div className="w-1 h-28 left-[157.30px] top-[73.25px] absolute bg-white" />
                <div className="w-1 h-28 left-[86.52px] top-[76.69px] absolute bg-white" />
                <div className="w-1 h-28 left-[27.53px] top-[73.74px] absolute bg-white" />
                <div className="w-1 h-28 left-[307.73px] top-[14.26px] absolute bg-white" />
                <div className="p-2 left-[241px] top-[3px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                  <div className="w-12 h-12 relative">
                    <div className="w-14 h-14 left-[-3px] top-[-3px] absolute bg-indigo-950" style={{ borderRadius: '50%' }} />
                    <img
                      className="w-10 h-10 left-[5px] top-[5px] absolute"
                      src="/new-file1.svg"
                    />
                  </div>
                </div>
                <div className="p-2 left-[7px] top-[3px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                  <div className="w-12 h-12 relative">
                    <div className="w-14 h-14 left-[-3px] top-[-3px] absolute bg-indigo-950 rounded-full" />
                    <img
                      className="w-12 h-12 left-0 top-0 absolute"
                      src="/new-file5.svg"
                    />
                  </div>
                </div>
                <div className="p-2 left-[163px] top-[3px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                  <div className="w-12 h-12 relative">
                    <div className="w-14 h-14 left-[-3px] top-[-3px] absolute bg-indigo-950" style={{ borderRadius: '50%' }} />
                    <img
                      className="w-8 h-7 left-[9.41px] top-[10.30px] absolute"
                      src="/new-file2.svg"
                      
                    />
                  </div>
                </div>
                <div className="p-2 left-[85px] top-[3px] absolute bg-white rounded-[999px] shadow-[0px_4px_20px_0px_rgba(19,13,80,0.25)] inline-flex justify-center items-center gap-1">
                  <div className="w-12 h-12 relative">
                    <div className="w-14 h-14 left-[-3px] top-[-3px] absolute bg-indigo-950 rounded-full" />
                    <img
                      className="w-8 h-8 left-[9px] top-[9px] absolute"
                      src="new-file4.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedMobile;
