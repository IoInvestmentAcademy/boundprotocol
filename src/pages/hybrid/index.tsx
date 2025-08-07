import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";

export default function HybridPage() {
  useEffect(() => {
    // Create particles background
    const createParticles = () => {
      const particlesContainer = document.getElementById("particles");
      if (!particlesContainer) return;

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 6 + "s";
        particle.style.animationDuration = 4 + Math.random() * 4 + "s";
        particlesContainer.appendChild(particle);
      }
    };

    // Initialize particles
    createParticles();
  }, []);

  return (
    <>
      <Head>
        <title>BOUND - The DeFi Yield Stablecoin</title>
        <meta
          name="description"
          content="A professional-grade DeFi platform that transforms complex yield strategies into seamless, automated returns."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Animated Background Particles */}
      <div className="particles" id="particles"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] px-6 sm:px-10 py-5 flex justify-between items-center bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <img
            src="/favicon.png"
            alt="BOUND Logo"
            className="w-8 h-8 rounded-lg"
          />
          <span className="text-white">BOUND</span>
        </div>
        <nav className="flex gap-4 sm:gap-8 items-center">
          <Link
            href="#docs"
            className="text-white text-base hover:text-purple-500 transition-colors"
          >
            Docs
          </Link>
          <Link
            href="#app"
            className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-3 rounded-full text-white font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
          >
            Launch App
          </Link>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="min-h-screen flex items-center relative px-6 sm:px-10">
        <div className="max-w-4xl z-[2]">
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-light leading-tight mb-8 bg-gradient-to-br from-white to-purple-500 bg-clip-text text-transparent">
            The DeFi Yield
            <br />
            Stablecoin
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
            A professional-grade DeFi platform that transforms complex yield
            strategies into seamless, automated returns.
          </p>
          <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 px-6 py-4 rounded-full backdrop-blur-md">
            <img
              src="/boundlogo.png"
              alt="BOUND Token"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white">BOUND</span>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-2 rounded-full font-bold text-lg">
              18.44% APY
            </div>
          </div>
        </div>

        {/* Background Video */}
        <div className="absolute inset-0 z-[1] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ filter: "blur(1px)" }}
          >
            <source src="/HQ.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </main>

      {/* Partners Section */}
      <section className="py-20 px-6 sm:px-10 text-center relative z-[2]">
        <h2 className="text-lg text-gray-400 mb-10 font-normal">Trusted by</h2>
        <div className="flex justify-center items-center gap-8 sm:gap-16 flex-wrap max-w-6xl mx-auto">
          <a
            href="https://enzyme.finance/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/enzyme.png"
              alt="Enzyme"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href="https://www.microsoft.com/en-us/startups"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/microsoft.png"
              alt="Microsoft"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href="https://avantgarde.finance/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/avantgarde.png"
              alt="Avantgarde"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href="https://www.base.org/build"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/chain.png"
              alt="Base"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <a
            href="https://yardhub.tech/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/yardhub.png"
              alt="yard[hub]"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 sm:px-10 border-t border-white/10 relative z-[2]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-base text-gray-400">
            <img
              src="/favicon.png"
              alt="BOUND Logo"
              className="w-6 h-6 rounded-lg"
            />
            <span>powered by IO INVESTMENT</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-gray-600">
              © 2025 BOUND. All rights reserved.
            </span>
            <Link
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all hover:bg-purple-500/30 hover:-translate-y-0.5"
            >
              𝕏
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(
            135deg,
            #0a0a0f 0%,
            #1a1a2e 50%,
            #16213e 100%
          );
          color: white;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(139, 92, 246, 0.5);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(1deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

          .nav-links {
            display: none;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .trusted-logos {
            flex-wrap: wrap;
            gap: 1.5rem;
          }

          .apy-badge {
            padding: 0.8rem 1.5rem;
            gap: 0.8rem;
          }

          .apy-text {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
