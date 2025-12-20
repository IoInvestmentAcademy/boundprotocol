import { motion } from "framer-motion";
import {
  textReveal,
  cardHover,
  imageReveal,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

function Team() {
  return (
    <motion.section
      className="w-full min-h-screen py-12 lg:py-20 xl:py-24 px-5 lg:px-10 xl:px-20 relative overflow-hidden bg-[#F7F6FE]"
      {...textReveal}
    >
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img
          src="/team-background.svg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-[1280px] mx-auto relative z-[2]">
        {/* Header Section */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px] font-semibold leading-[1.2] text-center text-zinc-800 font-['Hanken_Grotesk'] tracking-[-0.5px] lg:tracking-[-1px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Team Presentation
          </motion.h2>
          <motion.p
            className="text-base lg:text-lg font-normal leading-6 lg:leading-7 text-center text-neutral-400 font-['Hanken_Grotesk'] max-w-[838px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our team and partners is a blend of innovative thinkers, experienced
            investors, and blockchain enthusiasts united by a common mission: to
            redefine the way the world invests. Together, we're creating a
            secure, transparent, and scalable platform that empowers users to
            achieve their financial goals.
          </motion.p>
        </motion.div>
        {/* Team Image Section */}
        <motion.div
          className="w-full mb-12 lg:mb-16 flex justify-center"
          {...imageReveal}
        >
          <div className="w-full max-w-[1136px] h-auto lg:h-[700px] relative">
            <motion.div
              className="w-full h-[400px] lg:h-[650px] relative bg-neutral-200 rounded-[20px] overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                className="w-full h-full object-cover"
                src="/team-video-image.png"
                alt="Team presentation"
              />
              <motion.div
                className="w-24 h-24 lg:w-32 lg:h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute bg-white/30 rounded-full border-4 border-zinc-500 backdrop-blur-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src="/play-video.svg" alt="Play icon" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Executive Members Section */}
        <motion.div
          className="flex flex-col items-center gap-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h3
            className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[48px] xl:text-[57px] font-semibold leading-[1.2] text-center text-zinc-800 font-['Hanken_Grotesk'] tracking-[-0.5px] lg:tracking-[-1px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Executive Members
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 w-full max-w-[1200px]"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Member 1 */}
            <motion.div
              className="flex flex-col items-center gap-5"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/george.png"
                  alt="Georgian Ionita"
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
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
            </motion.div>
            {/* Member 2 */}
            <motion.div
              className="flex flex-col items-center gap-5"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/joshua.png"
                  alt="Joshua Oloma"
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
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
            </motion.div>
            {/* Member 3 */}
            <motion.div
              className="flex flex-col items-center gap-5"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/monalisa.png"
                  alt="Mona El Isa"
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
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
            </motion.div>
            {/* Member 4 */}
            <motion.div
              className="flex flex-col items-center gap-5"
              variants={staggerItem}
              {...cardHover}
            >
              <div className="w-full max-w-[288px] aspect-square relative bg-neutral-200 rounded-[20px] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="/frances.png"
                  alt="Frances Edwards"
                />
                <div data-svg-wrapper className="absolute bottom-4 right-4">
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
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Team;
