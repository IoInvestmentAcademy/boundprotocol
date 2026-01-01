import { motion } from "framer-motion";
import { textReveal, staggerContainer, staggerItem, cardHover, imageReveal } from "../utils/animations";

function Comparison() {
  const challenges = [
    {
      title: "Too Complicated",
      description: "Steep learning curves and complex tools make on-chain investing overwhelming.",
      icon: "red"
    },
    {
      title: "Risky Without Expertise",
      description: "Accessing on-chain financial products safely requires deep expertise.",
      icon: "red"
    },
    {
      title: "Takes Too Much Time",
      description: "Managing strategies, monitoring rates, and rebalancing require ongoing involvement.",
      icon: "red"
    }
  ];

  const solutions = [
    {
      title: "Easy Access",
      description: "One-tap access to a diversified basket of professionally managed on-chain strategies.",
      icon: "green"
    },
    {
      title: "Passive Exposure",
      description: "A professional, end-to-end approach designed to deliver passive returns without effort.",
      icon: "green"
    },
    {
      title: "You Stay in Control",
      description: "Enjoy full transparency and complete control over your funds at all times.",
      icon: "green"
    }
  ];

  return (
    <motion.section 
      className="w-full bg-white py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20"
      {...textReveal}
    >
      <div className="max-w-[1280px] mx-auto overflow-hidden">
        {/* Header Section */}
        <motion.div 
          className="flex flex-col items-center gap-5 mb-12 lg:mb-14"
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
            Earn Better Rates with On-Chain Returns
          </motion.h2>
          <motion.p 
            className="text-base font-normal leading-6 text-center
            text-[#4D4D4D] max-w-[794px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            There's a smarter way to grow your savings. On-chain financial markets unlocks access to higher rates than traditional savings products.
          </motion.p>
        </motion.div>

        {/* Comparison Section */}
        <div className="relative w-full min-h-[660px] lg:min-h-[660px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
          {/* Left Side - Challenges - Third on mobile, first on desktop */}
          <motion.div 
            className="w-full lg:w-auto lg:flex-1 flex flex-col items-start lg:items-end gap-6 lg:gap-8 pl-0 lg:pr-8 order-3 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3 
              className="text-[28px] sm:text-[32px] lg:text-[36px] font-semibold leading-[1.25] 
              text-left lg:text-right text-[#1a1a1a] mb-4 lg:mb-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              The challenge of<br />on-chain access
            </motion.h3>
            
            <motion.div 
              className="flex flex-col gap-6 lg:gap-8 w-full lg:w-auto max-w-[320px]"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {challenges.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-5 justify-start lg:justify-end"
                  variants={staggerItem}
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center order-1 lg:order-2">
                    <img 
                      src="/close-circle-fill.svg" 
                      alt="" 
                      className="w-10 h-10"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-start lg:items-end gap-2 order-2 lg:order-1">
                    <h4 className="text-xl font-semibold leading-6 text-left lg:text-right text-[#1a1a1a]">
                      {item.title}
                    </h4>
                    <p className="text-sm font-normal leading-5 text-left lg:text-right text-[#9CA3AF]">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Center Image - First on mobile, center on desktop */}
          <motion.div 
            className="w-full lg:w-auto flex-shrink-0 order-1 lg:order-2 mb-8 lg:mb-0"
            {...imageReveal}
          >
            <div className="w-full max-w-[400px] lg:max-w-[626px] mx-auto">
              <img 
                src="/comparision-image.png" 
                alt="Comparison" 
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Right Side - Solutions - Second on mobile, right on desktop */}
          <motion.div 
            className="w-full lg:w-auto lg:flex-1 flex flex-col items-start lg:items-start gap-6 lg:gap-8 pl-0 lg:pl-8 order-2 lg:order-3"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3 
              className="text-[28px] sm:text-[32px] lg:text-[36px] font-semibold leading-[1.25] 
              text-left text-[#1a1a1a] mb-4 lg:mb-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Simple access to<br />on-chain returns
            </motion.h3>
            
            <motion.div 
              className="flex flex-col gap-6 lg:gap-8 w-full lg:w-auto max-w-[320px]"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
            >
              {solutions.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-5 justify-start"
                  variants={staggerItem}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src="/checkbox-circle-fill.svg" 
                      alt="" 
                      className="w-10 h-10"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-start gap-2">
                    <h4 className="text-xl font-semibold leading-6 text-left text-[#1a1a1a]">
                      {item.title}
                    </h4>
                    <p className="text-sm font-normal leading-5 text-left text-[#9CA3AF]">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default Comparison;
