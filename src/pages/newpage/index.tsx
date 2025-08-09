import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function NewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Advanced 3D Globe Implementation with BOUND text
    const initGlobe = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      const size = Math.min(500, window.innerWidth * 0.8);
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;

      // Globe state
      let rotation = 0;
      let time = 0;

      // Generate points on sphere using Fibonacci sphere
      interface Point {
        x: number;
        y: number;
        z: number;
        originalIntensity: number;
      }

      const points: Point[] = [];
      const numPoints = 800;

      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = (i * 2.39996323) % (2 * Math.PI);

        points.push({
          x: Math.cos(theta) * radiusAtY,
          y: y,
          z: Math.sin(theta) * radiusAtY,
          originalIntensity: Math.random() * 0.8 + 0.2,
        });
      }

      function draw() {
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Create gradient background for glow effect
        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.3,
          centerX,
          centerY,
          radius * 1.3
        );
        glowGradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
        glowGradient.addColorStop(0.4, "rgba(139, 92, 246, 0.1)");
        glowGradient.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, size, size);

        // Draw sphere outline
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fill sphere with dark gradient
        const sphereGradient = ctx.createRadialGradient(
          centerX - radius * 0.3,
          centerY - radius * 0.3,
          0,
          centerX,
          centerY,
          radius
        );
        sphereGradient.addColorStop(0, "rgba(30, 30, 60, 0.9)");
        sphereGradient.addColorStop(1, "rgba(10, 10, 20, 0.95)");
        ctx.fillStyle = sphereGradient;
        ctx.fill();

        // Transform and draw points (only outer edge)
        const transformedPoints = points.map((point) => {
          // Rotate around Y axis
          const rotY = rotation;
          const x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
          const z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);

          return {
            x: x,
            y: point.y,
            z: z,
            originalIntensity: point.originalIntensity,
          };
        });

        // Sort points by Z coordinate (back to front)
        transformedPoints.sort((a, b) => a.z - b.z);

        // Draw points only on the outer edge
        transformedPoints.forEach((point) => {
          if (point.z > 0.2) {
            // Only draw front-facing points on the surface
            const screenX = centerX + point.x * radius;
            const screenY = centerY + point.y * radius;

            // Check if point is within sphere bounds
            const distFromCenter = Math.sqrt(
              Math.pow(screenX - centerX, 2) + Math.pow(screenY - centerY, 2)
            );

            if (distFromCenter <= radius && distFromCenter >= radius * 0.95) {
              // Calculate intensity based on Z position and time
              const depthFactor = (point.z + 1) / 2;
              const timeFactor =
                Math.sin(time + point.originalIntensity * 10) * 0.3 + 0.7;
              const intensity =
                point.originalIntensity * depthFactor * timeFactor;

              // Draw point
              ctx.beginPath();
              const pointRadius = 1 + intensity * 1.5;
              ctx.arc(screenX, screenY, pointRadius, 0, Math.PI * 2);

              // Color based on intensity and position
              const alpha = intensity * 0.6;
              const hue = 270 + intensity * 20;
              ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${alpha})`;
              ctx.fill();
            }
          }
        });

        // Draw BOUND text in the center
        ctx.save();
        ctx.font = `bold ${
          size * 0.12
        }px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Create text gradient
        const textGradient = ctx.createLinearGradient(
          centerX - size * 0.1,
          centerY - size * 0.05,
          centerX + size * 0.1,
          centerY + size * 0.05
        );
        textGradient.addColorStop(0, "#8b5cf6");
        textGradient.addColorStop(0.5, "#a855f7");
        textGradient.addColorStop(1, "#c084fc");

        // Add text shadow
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(139, 92, 246, 0.5)";

        ctx.fillStyle = textGradient;
        ctx.fillText("BOUND", centerX, centerY);

        // Add subtle pulse effect to text
        const pulseScale = 1 + Math.sin(time * 2) * 0.02;
        ctx.scale(pulseScale, pulseScale);
        ctx.restore();

        // Update rotation and time
        rotation += 0.005;
        time += 0.02;

        requestAnimationFrame(draw);
      }

      draw();
    };

    // Mobile menu functionality
    const mobileMenu = document.querySelector(".mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenu && navLinks) {
      mobileMenu.addEventListener("click", function () {
        const navLinksElement = navLinks as HTMLElement;
        navLinksElement.style.display =
          navLinksElement.style.display === "flex" ? "none" : "flex";
      });
    }

    // Initialize everything
    createParticles();
    initGlobe();

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        initGlobe();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>The DeFi Yield Stablecoin</title>
        <meta
          name="description"
          content="A professional-grade DeFi platform that transforms complex yield strategies into seamless, automated returns."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Animated Background Particles */}
      <div className="particles" id="particles"></div>

      {/* Background Image */}
      <div className="fixed inset-0 z-[0] overflow-hidden">
        <img
          src="/backgroundimage.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{ filter: "blur(1px)" }}
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Navigation */}
      {/* <nav className="navbar">
        <div className="logo">BOUND</div>
        <div className="nav-links">
          <Link href="#" className="nav-link">
            Docs
          </Link>
          <Link href="#" className="nav-link">
            About
          </Link>
          <Link href="#" className="nav-link">
            Community
          </Link>
        </div>
        <Link href="#" className="launch-btn">
          Launch App
        </Link>
        <button className="mobile-menu">☰</button>
      </nav> */}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex justify-between items-center bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/favicon.png"
            alt="BOUND Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg"
          />
          <span className="text-white text-xl sm:text-xl lg:text-2xl font-black block">
            BOUND
          </span>
        </div>
        <nav className="flex gap-2 sm:gap-4 lg:gap-8 items-center">
          <Link
            href="/litepapers"
            className="text-white text-sm sm:text-base hover:text-purple-500 transition-colors px-2 sm:px-3 py-1 sm:py-2 rounded"
          >
            Docs
          </Link>
          <Link
            href="https://app.boundprotocol.com"
            target="_blank"
            className="bg-gradient-to-br from-purple-500 to-purple-600 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-white text-sm sm:text-base font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30"
          >
            Launch App
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-light leading-tight mb-6 sm:mb-8 bg-gradient-to-br from-white to-purple-500 bg-clip-text text-transparent">
            The DeFi Yield
            <br className="sm:hidden" /> Stablecoin
          </h1>
          <p className="text-base sm:text-xl text-gray-400 leading-relaxed mb-8 sm:mb-10 max-w-2xl">
            A professional-grade DeFi platform that transforms complex yield
            strategies into seamless, automated returns.
          </p>

          <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 px-6 py-4 rounded-full">
            <img
              src="/boundlogo.png"
              alt="BOUND Token"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white text-sm sm:text-base">BOUND</span>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-sm sm:text-lg">
              18.44% APY
            </div>
          </div>
        </div>

        <div className="globe-container">
          <canvas ref={canvasRef} id="globe-canvas"></canvas>

          {/* Floating DeFi Icons Around Globe */}
          <div className="floating-icons">
            <div className="floating-icon gray-dollar-icon">
              <div className="gray-dollar">$</div>
              <div className="dashed-circle"></div>
            </div>
            <div className="floating-icon yearn-icon">
              <div className="yearn-symbol">
                <div className="yearn-branch yearn-left"></div>
                <div className="yearn-branch yearn-center"></div>
                <div className="yearn-branch yearn-right"></div>
              </div>
            </div>
            <div className="floating-icon dai-icon">
              <div className="dai-symbol">
                <div className="dai-d">D</div>
                <div className="dai-lines">
                  <div className="dai-line-top"></div>
                  <div className="dai-line-bottom"></div>
                </div>
              </div>
            </div>
            <div className="floating-icon green-dollar-icon">
              <div className="green-circle">
                <div className="green-dollar">$</div>
              </div>
            </div>
            <div className="floating-icon tether-icon">
              <div className="tether-symbol">₮</div>
            </div>
            <div className="floating-icon frax-icon">
              <div className="frax-arrows">
                <div className="arrow-left"></div>
                <div className="arrow-right"></div>
              </div>
            </div>
            <div className="floating-icon dollar-circle-icon">
              <div className="dollar-symbol">$</div>
              <div className="circle-brackets">
                <div className="bracket-left"></div>
                <div className="bracket-right"></div>
              </div>
            </div>
            <div className="floating-icon usdc-icon">
              <div className="usdc-dollar">$</div>
              <div className="usdc-brackets">
                <div className="usdc-bracket-left"></div>
                <div className="usdc-bracket-right"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      {/* <div className="trusted-by">
        <div className="trusted-text">Trusted by</div>
        <div className="trusted-logos">
          <div className="trusted-logo">enzyme</div>
          <div className="trusted-logo">Microsoft</div>
          <div className="trusted-logo">AVANTGARDE</div>
          <div className="trusted-logo">Chainlink</div>
          <div className="trusted-logo">yard[hub]</div>
        </div>
      </div> */}

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
              src="/ioicon.png"
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

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem 2rem;
          backdrop-filter: blur(10px);
          background: rgba(10, 10, 15, 0.8);
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(139, 92, 246, 0.1);
        }

        .logo {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s ease, transform 0.2s ease;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .nav-link:hover {
          color: #a855f7;
          transform: translateY(-1px);
          background: rgba(139, 92, 246, 0.1);
        }

        .launch-btn {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .launch-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }

        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 0 4rem;
          gap: 4rem;
          position: relative;
        }

        .hero-content {
          z-index: 2;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ffffff, #e5e7eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 1s ease-out;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
          line-height: 1.6;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .apy-badge {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 1rem 2rem;
          border-radius: 50px;
          margin-bottom: 3rem;
          backdrop-filter: blur(10px);
          animation: fadeInUp 1s ease-out 0.4s both,
            pulse 2s ease-in-out infinite;
        }

        .apy-text {
          font-size: 2rem;
          font-weight: 700;
          color: #a855f7;
        }

        .globe-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 1.5s ease-out 0.6s both;
        }

        .floating-icons {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .floating-icon {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          animation: floatIcon 4s ease-in-out infinite;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .floating-icon.gray-dollar-icon {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          top: 10%;
          right: 15%;
          animation-delay: 0s;
          position: absolute;
          border: 2px solid #dee2e6;
        }

        .gray-dollar {
          color: #212529;
          font-size: 28px;
          font-weight: bold;
          text-shadow: none;
          z-index: 2;
          position: relative;
        }

        .dashed-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          border: 3px dashed #212529;
          border-radius: 50%;
          opacity: 0.8;
        }

        .floating-icon.yearn-icon {
          background: linear-gradient(135deg, #1f2937, #111827);
          top: 30%;
          left: 10%;
          animation-delay: 0.5s;
          position: absolute;
        }

        .yearn-symbol {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .yearn-branch {
          position: absolute;
          width: 4px;
          height: 16px;
          border-radius: 2px;
          background: linear-gradient(180deg, #f97316, #fed7aa);
        }

        .yearn-left {
          left: 6px;
          top: 8px;
          transform: rotate(-30deg);
          background: linear-gradient(180deg, #f97316, #fde68a);
        }

        .yearn-center {
          left: 14px;
          top: 4px;
          transform: rotate(0deg);
          background: linear-gradient(180deg, #f97316, #ffffff);
        }

        .yearn-right {
          right: 6px;
          top: 8px;
          transform: rotate(30deg);
          background: linear-gradient(180deg, #f97316, #fde68a);
        }

        .floating-icon.dai-icon {
          background: linear-gradient(135deg, #ffb000, #ff8f00);
          top: 35%;
          right: 8%;
          animation-delay: 1s;
          position: absolute;
        }

        .dai-symbol {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dai-d {
          color: white;
          font-size: 28px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          z-index: 2;
          position: relative;
        }

        .dai-lines {
          position: absolute;
          width: 32px;
          height: 32px;
          top: 0;
          left: 0;
        }

        .dai-line-top,
        .dai-line-bottom {
          position: absolute;
          width: 28px;
          height: 3px;
          background: white;
          left: 2px;
        }

        .dai-line-top {
          top: 12px;
        }

        .dai-line-bottom {
          bottom: 12px;
        }

        .floating-icon.green-dollar-icon {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          bottom: 15%;
          left: 20%;
          animation-delay: 1.5s;
          position: absolute;
          border: 3px solid #dcfce7;
        }

        .green-circle {
          position: relative;
          width: 40px;
          height: 40px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .green-dollar {
          color: white;
          font-size: 24px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .floating-icon.tether-icon {
          background: linear-gradient(135deg, #26a69a, #00897b);
          top: 5%;
          left: 40%;
          animation-delay: 2s;
          position: absolute;
        }

        .tether-symbol {
          color: white;
          font-size: 30px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .floating-icon.frax-icon {
          background: linear-gradient(135deg, #26a69a, #00897b);
          bottom: 5%;
          right: 35%;
          animation-delay: 2.5s;
          position: absolute;
        }

        .frax-arrows {
          position: relative;
          width: 30px;
          height: 20px;
        }

        .arrow-left,
        .arrow-right {
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .arrow-left {
          border-right: 12px solid white;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }

        .arrow-right {
          border-left: 12px solid white;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }

        .floating-icon.dollar-circle-icon {
          background: linear-gradient(135deg, #424242, #212121);
          top: 50%;
          left: 5%;
          animation-delay: 3s;
          position: absolute;
        }

        .dollar-symbol {
          color: #ffd700;
          font-size: 24px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .circle-brackets {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 42px;
          height: 42px;
        }

        .bracket-left,
        .bracket-right {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #ffd700;
          top: 50%;
          transform: translateY(-50%);
        }

        .bracket-left {
          left: 2px;
          border-right: none;
          border-top: none;
          border-bottom: none;
          border-left: 3px solid #ffd700;
          border-radius: 20px 0 0 20px;
        }

        .bracket-right {
          right: 2px;
          border-left: none;
          border-top: none;
          border-bottom: none;
          border-right: 3px solid #ffd700;
          border-radius: 0 20px 20px 0;
        }

        .floating-icon.usdc-icon {
          background: linear-gradient(135deg, #2775ca, #1e5f99);
          bottom: 20%;
          right: 10%;
          animation-delay: 3.5s;
          position: absolute;
        }

        .usdc-dollar {
          color: white;
          font-size: 28px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .usdc-brackets {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 42px;
          height: 42px;
        }

        .usdc-bracket-left,
        .usdc-bracket-right {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid white;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }

        .usdc-bracket-left {
          left: 2px;
          border-right: none;
          border-top: none;
          border-bottom: none;
          border-left: 3px solid white;
          border-radius: 20px 0 0 20px;
        }

        .usdc-bracket-right {
          right: 2px;
          border-left: none;
          border-top: none;
          border-bottom: none;
          border-right: 3px solid white;
          border-radius: 0 20px 20px 0;
        }

        @keyframes floatIcon {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        #globe-canvas {
          width: 500px;
          height: 500px;
          border-radius: 50%;
          box-shadow: 0 0 100px rgba(139, 92, 246, 0.3),
            0 0 200px rgba(139, 92, 246, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .trusted-by {
          position: absolute;
          bottom: 2rem;
          left: 4rem;
          right: 4rem;
          text-align: center;
          animation: fadeIn 2s ease-out 1s both;
        }

        .trusted-text {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .trusted-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          opacity: 0.7;
        }

        .trusted-logo {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          transition: color 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }

        .trusted-logo:hover {
          color: #a855f7;
          transform: scale(1.05);
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(1deg);
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

        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem;
            gap: 2rem;
          }

          .hero-title {
            font-size: 3rem;
          }

          #globe-canvas {
            width: 400px;
            height: 400px;
          }

          .trusted-by {
            position: relative;
            margin-top: 4rem;
            left: auto;
            right: auto;
            bottom: auto;
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

          #globe-canvas {
            width: 300px;
            height: 300px;
          }

          .floating-icons {
            width: 350px;
            height: 350px;
          }

          .floating-icon {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }

          .floating-icon.gray-dollar-icon {
            top: 8%;
            right: 12%;
          }

          .floating-icon.yearn-icon {
            top: 25%;
            left: 8%;
          }

          .floating-icon.dai-icon {
            top: 30%;
            right: 6%;
          }

          .floating-icon.green-dollar-icon {
            bottom: 12%;
            left: 15%;
          }

          .floating-icon.tether-icon {
            top: 3%;
            left: 35%;
          }

          .floating-icon.frax-icon {
            bottom: 3%;
            right: 30%;
          }

          .floating-icon.dollar-circle-icon {
            top: 45%;
            left: 3%;
          }

          .floating-icon.usdc-icon {
            bottom: 15%;
            right: 8%;
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

        .mobile-menu {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
