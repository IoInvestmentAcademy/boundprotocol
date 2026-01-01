import { motion } from "framer-motion";
import {
  stepReveal,
  imageReveal,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

function Step() {
  const steps = [
    {
      number: 1,
      title: "Fund Your Account",
      description: "Top up your account using your card or crypto wallet.",
      icon: "/arrow-right-circle-fill-blue.svg",
      titleColor: "text-[#220DFF]",
      descriptionColor: "text-[#220DFF]",
    },
    {
      number: 2,
      title: "Deposit into Savings",
      description: "Move your balance into your savings vault with one tap.",
      icon: "/arrow-right-circle-fill.svg",
      titleColor: "text-[#282828]",
      descriptionColor: "text-[#4D4D4D]",
    },
    {
      number: 3,
      title: "Activate Your Savings",
      description: "Turn on yield and let your money work automatically.",
      icon: "/arrow-right-circle-fill.svg",
      titleColor: "text-[#282828]",
      descriptionColor: "text-[#4D4D4D]",
    },
    {
      number: 4,
      title: "Watch Your Balance Grow",
      description:
        "Your yield compounds automatically. No complexity. Just growing wealth, on autopilot.",
      icon: "/arrow-right-circle-fill.svg",
      titleColor: "text-[#282828]",
      descriptionColor: "text-[#4D4D4D]",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {/* Mobile Background Image */}
        <img
          src="/stepperbackgroundmobile.svg"
          alt=""
          className="block lg:hidden w-full h-full object-cover object-center"
          aria-hidden="true"
          loading="lazy"
        />
        {/* Desktop Background Image with shadow opacity */}
        <img
          src="/stepperbackground.svg"
          alt=""
          className="hidden lg:block w-full h-full object-cover object-center"
          aria-hidden="true"
          loading="lazy"
          style={{     position: "absolute",
            top: "-250px",
            opacity: "0.5" }}
        />
      </div>

      <div
        className="relative z-[2] w-full flex justify-center items-center mb-5 px-5 py-10 lg:px-20 lg:py-[100px]"
      >
        <div className="max-w-[1280px] w-full overflow-hidden flex flex-col justify-start items-center gap-20 lg:gap-40">
          {/* Mobile Header Section */}
          <motion.div
            className="lg:hidden w-full flex flex-col justify-start items-center gap-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.25, ease: "linear" }}
          >
            <motion.h2
              className="w-full text-center text-[#282828] text-[28px] 
              font-semibold font-sans leading-[33.6px] break-words"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              Built to Handle Your Savings With Care
              <br />
              Wealth with BOUND App
              <br />
              in 4 Easy Steps
            </motion.h2>
            <motion.p
              className="w-full text-center text-[#A8A8A8] text-base 
              font-normal font-sans leading-6 break-words"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              Experience a simpler, smarter way to earn better rates with DeFi
              powered professional returns.
            </motion.p>
          </motion.div>

          {/* Desktop Header Section */}
          <motion.div
            className="hidden lg:flex w-full flex flex-col justify-start items-center gap-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.25, ease: "linear" }}
          >
            <motion.h2
              className="w-full text-center text-[#282828] text-[48px] 
              font-semibold font-sans leading-[57.6px] break-words"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              How to Grow Your Wealth with
              <br />
              BOUND App in 4 Easy Steps
            </motion.h2>
            <motion.p
              className="w-full max-w-[820px] text-center text-[#6B6767] text-lg 
              font-normal font-sans leading-[27px] break-words"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, ease: "linear" }}
            >
              Experience a simpler, smarter way to earn better rates with
              On-Chain powered professional returns.
            </motion.p>
          </motion.div>

          {/* Mobile Steps Content Section - Different structure for mobile */}
          <div
            className="lg:hidden w-full max-w-[353px] px-5 py-10 
            bg-gradient-to-b from-[#F3F2FD] to-[#D6D3F8] rounded-[24px] 
            backdrop-blur-[50px] flex flex-col justify-start items-center gap-10"
          >
            {/* Mobile Image Section */}
            <div
              style={{
                width: "100%",
                height: "238px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "677px",
                  height: "345px",
                  left: "-49px",
                  top: "-107px",
                  position: "absolute",
                  overflow: "hidden",
                }}
              >
                <img
                  style={{
                    width: "260px",
                    height: "531px",
                    left: "0.5px",
                    top: "0px",
                    position: "absolute",
                    opacity: 0.7,
                  }}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQQAAAFZCAYAAAB+GFEjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGBSURBVHgB7dZBDQAgEAOwG/49jw8keKBV0bTNHEk6wLfWAFzvEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICfbBmdBwLURNRTAAAAAElFTkSuQmCC"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  style={{
                    width: "649px",
                    height: "669px",
                    left: "-115px",
                    top: "-52px",
                    position: "absolute",
                  }}
                  src="/step-image.png"
                  alt="BOUND App Steps"
                  loading="lazy"
                />
                <div
                  style={{
                    width: "238.20px",
                    height: "512.46px",
                    left: "11.60px",
                    top: "9.29px",
                    position: "absolute",
                  }}
                ></div>
              </div>
            </div>

            {/* Mobile Steps List */}
            <motion.div
              className="w-full flex flex-col justify-start items-start gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="w-full flex justify-start items-center gap-5"
                  variants={staggerItem}
                  {...stepReveal(index)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={step.icon}
                      alt=""
                      className="w-7 h-7"
                      aria-hidden="true"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <h3
                      className={`w-full ${step.titleColor} text-base font-semibold font-sans leading-[19.2px] break-words`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`w-full ${step.descriptionColor} text-sm font-normal font-sans leading-[21px] break-words`}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Desktop Steps Content Section - Keep existing desktop code */}
          <div
            className="hidden lg:flex w-full max-w-[1060px] px-12 py-10 
            bg-gradient-to-b from-[#F3F2FD] to-[#D6D3F8] rounded-[32px] 
            backdrop-blur-[50px] flex-row justify-between items-center gap-0"
          >
            {/* Image Section - Using Pure CSS to match HTML exactly */}
            <div
              style={{
                width: "398px",
                height: "398px",
                position: "relative",
              }}
              className="flex-shrink-0 order-2 lg:order-1 mx-auto lg:mx-0"
            >
              {/* Circle Background */}
              <div
                style={{
                  width: "397.99px",
                  height: "397.99px",
                  left: "0px",
                  top: "0px",
                  position: "absolute",
                  background: "#9387ec",
                  borderRadius: "9999px",
                }}
              ></div>

              {/* Image Container */}
              <div
                style={{
                  width: "777.26px",
                  height: "814px",
                  left: "0px",
                  top: "-123.24px",
                  position: "absolute",
                }}
              >
                {/* Base64 Background Image */}
                <img
                  style={{
                    width: "398.26px",
                    height: "814px",
                    left: "0px",
                    top: "0px",
                    position: "absolute",
                    opacity: 0.7,
                  }}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY8AAAIyCAYAAAAzJkbRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAOaSURBVHgB7dnLDcAgEEPBdfrveXPOBwFnZpp4spzuTr0k6QKAgasAYNMnHlYHADOPeAgHAEv+Pg8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5xA7tmCQourdEeAAAAAElFTkSuQmCC"
                  alt=""
                  aria-hidden="true"
                />
                {/* Main Step Image */}
                <img
                  style={{
                    width: "100%",
                    height: "1100px",
                    left: "-181px",
                    top: "-76.76px",
                    position: "absolute",
                  }}
                  src="/step-image.png"
                  loading="lazy"
                  alt="BOUND App Steps"
                />
                {/* Empty overlay div */}
                <div
                  style={{
                    width: "364.87px",
                    height: "785.58px",
                    left: "0px",
                    top: "242.6px",
                    position: "absolute",
                  }}
                ></div>
              </div>
            </div>

            {/* Steps List */}
            <motion.div
              className="w-full lg:w-[450px] flex flex-col justify-start items-start gap-6 order-1 lg:order-2"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="w-full flex justify-start items-center gap-5"
                  variants={staggerItem}
                  {...stepReveal(index)}
                  whileHover={{ x: 5 }}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={step.icon}
                      alt=""
                      className="w-8 h-8"
                      aria-hidden="true"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <h3
                      className={`w-full ${step.titleColor} text-lg sm:text-xl font-semibold font-sans leading-6 break-words`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`w-full ${step.descriptionColor} text-base font-normal font-sans leading-6 break-words`}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Step;
