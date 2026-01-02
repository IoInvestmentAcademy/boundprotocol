import { motion } from "framer-motion";
import {
  fadeIn,
  slideInLeft,
  getHeaderAnimation,
  getContentAnimation,
} from "../utils/scrollAnimations";

function Banner() {
  return (
    <motion.section
      className="w-full bg-[#F7F6FE] py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      variants={fadeIn}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Main Card */}
        <div className="w-full  h-auto lg:h-96 px-6 py-8 lg:px-12 lg:py-10 relative bg-gradient-to-r from-[#130D50] to-[#4D31B7] rounded-[40px] outline outline-1 outline-offset-[-1px] flex flex-col lg:flex-row justify-center lg:justify-start items-center gap-6 lg:gap-24 mx-auto">
          <div
            className="w-full  h-full lg:h-96 left-0 top-0 absolute overflow-hidden"
            style={{ contain: "layout style paint", willChange: "auto" }}
          >
            <div className=" h-[1998.09px] left-[1854.84px] top-[505.21px] absolute" />
          </div>
          <motion.div
            className="w-full lg:w-[580px] relative z-10 flex flex-col justify-start items-center lg:items-start gap-6 lg:gap-7"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            variants={slideInLeft}
          >
            <motion.div
              className="w-full lg:w-[660px] flex flex-col justify-start items-center lg:items-start gap-3"
              {...getHeaderAnimation()}
            >
              <motion.div
                className="w-full text-center lg:text-left justify-start text-white text-2xl sm:text-3xl lg:text-4xl font-semibold font-['Hanken_Grotesk'] leading-tight lg:leading-10"
                variants={fadeIn}
              >
                Start Earning Better on Your Savings
              </motion.div>
              <motion.div
                className="w-full text-center lg:text-left justify-start text-white text-sm sm:text-base font-normal font-['Hanken_Grotesk'] leading-5 lg:leading-6"
                {...getContentAnimation(0.2)}
              >
                Earn better rates through a simple savings experience designed
                to work for you.
                <br className="hidden lg:block" />
                <span className="lg:hidden"> </span>
                No complexity, no constant decisions, just a smarter way to make
                your money grow over time.
              </motion.div>
            </motion.div>
            <motion.div
              className="w-full lg:w-auto p-4 bg-white rounded-lg flex justify-center items-center gap-2 cursor-pointer"
              {...getContentAnimation(0.3)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="justify-start text-violet-600 text-sm font-bold font-['Hanken_Grotesk'] leading-5">
                Start Investing Now
              </div>
            </motion.div>
          </motion.div>
          <div className="hidden lg:block w-96 self-stretch relative" />
        </div>
      </div>
    </motion.section>
  );
}

export default Banner;
