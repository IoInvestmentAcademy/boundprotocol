import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const NewPage: React.FC = () => {
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <>
      <Head>
        <title>BOUND - The Professional DeFi Yield Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="BOUND - The DeFi Yield Stablecoin. Diversified exposure to professional yield strategies across premium stablecoins. One token, complete coverage of the stable yield market."
        />
        <meta
          name="keywords"
          content="DeFi, yield, stablecoin, BOUND, cryptocurrency, blockchain, investment, APY"
        />
        <meta name="author" content="BOUND" />
        <meta
          property="og:title"
          content="BOUND - The Professional DeFi Yield Platform"
        />
        <meta
          property="og:description"
          content="Diversified exposure to professional yield strategies across premium stablecoins. One token, complete coverage of the stable yield market."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://boundprotocol.com" />
        <meta property="og:image" content="/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="BOUND - The Professional DeFi Yield Platform"
        />
        <meta
          name="twitter:description"
          content="Diversified exposure to professional yield strategies across premium stablecoins."
        />
        <meta name="twitter:image" content="/favicon.png" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href="https://boundprotocol.com" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Inter", sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #f0f0f0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          border-color: #e2e8f0;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366f1;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-text {
          display: none;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
          font-size: 0.95rem;
        }

        .nav-link:hover {
          color: #6366f1;
        }

        .launch-btn {
          background: #6366f1;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .launch-btn:hover {
          background: #5855eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 6rem 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          gap: 3rem;
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;

          margin-bottom: 1.5rem;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #64748b;
          margin-bottom: 3rem;
          line-height: 1.6;
          font-weight: 400;
        }

        .cta-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 3rem;
        }

        .cta-primary {
          background: #6366f1;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .cta-primary:hover {
          background: #5855eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .cta-secondary {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .cta-secondary:hover {
          color: #6366f1;
          border-color: #6366f1;
          background: #f8fafc;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding: 2rem 0;
          border-top: 1px solid #f1f5f9;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Visual Section */
        .visual-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 500px;
        }

        .central-orb {
          width: 320px;
          height: 320px;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
          color: transparent;
          position: relative;
          box-shadow: none;
          animation: none;
        }

        .logo-container {
          position: relative;
          z-index: 10;
        }

        .bound-logo {
          width: 400px;
          height: 400px;
          object-fit: contain;
        }

        .logo-container::after {
          content: "BOUND";
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366f1;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .orb-ring {
          position: absolute;
          border: 2px solid rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        .ring-1 {
          width: 400px;
          height: 400px;
          top: -40px;
          left: -40px;
        }

        .ring-2 {
          width: 480px;
          height: 480px;
          top: -80px;
          left: -80px;
          animation-duration: 30s;
          animation-direction: reverse;
        }

        .floating-token {
          position: absolute;
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          animation: float 3s ease-in-out infinite;
          border: 2px solid #f1f5f9;
        }

        .token-1 {
          top: 20%;
          left: 10%;
          color: #000000;
          animation-delay: 0s;
        }

        .token-2 {
          top: 10%;
          right: 20%;
          color: #3b82f6;
          animation-delay: 1s;
        }

        .token-3 {
          bottom: 20%;
          left: 15%;
          color: #f59e0b;
          animation-delay: 2s;
        }

        .token-4 {
          bottom: 15%;
          right: 10%;
          color: #10b981;
          animation-delay: 0.5s;
        }

        .token-5 {
          top: 50%;
          left: 5%;
          color: #ef4444;
          animation-delay: 1.5s;
        }

        .token-6 {
          top: 50%;
          right: 5%;
          color: #06b6d4;
          animation-delay: 2.5s;
        }

        /* Features Section */
        .features {
          padding: 6rem 2rem;
          background: #f8fafc;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .features-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .features-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 4rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #6366f1;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #64748b;
          line-height: 1.6;
        }

        /* Powered By Element */
        .powered-by {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          background: rgba(71, 85, 105, 0.9);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          z-index: 100;
          transition: all 0.3s ease;
        }

        .powered-by:hover {
          background: rgba(71, 85, 105, 1);
          transform: translateY(-1px);
        }

        .trusted {
          padding: 3rem 2rem;
          text-align: center;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }

        .trusted-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .trusted-title {
          color: #94a3b8;
          margin-bottom: 2rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .trusted-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .trusted-logo {
          color: #cbd5e1;
          font-weight: 600;
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }

        .trusted-logo:hover {
          color: #6366f1;
        }

        /* Footer */
        .footer {
          padding: 4rem 2rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-logo {
          width: 24px;
          height: 24px;
          border-radius: 8px;
        }

        .footer-text {
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .copyright {
          color: #64748b;
          font-size: 0.9rem;
        }

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: translateY(-2px);
        }

        /* Animations */
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 60px rgba(99, 102, 241, 0.3),
              0 20px 40px rgba(99, 102, 241, 0.2);
          }
          50% {
            box-shadow: 0 0 80px rgba(99, 102, 241, 0.4),
              0 25px 50px rgba(99, 102, 241, 0.3);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero {
            padding: 6rem 3rem 2rem;
            gap: 3rem;
          }

          .navbar {
            padding: 1rem 3rem;
          }
        }

        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
            padding: 6rem 2rem 2rem;
          }

          .hero-content {
            order: 1;
          }

          .visual-container {
            order: 2;
          }

          .hero-title {
            font-size: 3rem;
          }

          .central-orb {
            width: 280px;
            height: 280px;
            font-size: 2rem;
          }

          .bound-logo {
            width: 320px;
            height: 320px;
          }

          .logo-container::after {
            font-size: 1.3rem;
            bottom: -2.5rem;
          }

          .ring-1 {
            width: 360px;
            height: 360px;
            top: -40px;
            left: -40px;
          }

          .ring-2 {
            width: 440px;
            height: 440px;
            top: -80px;
            left: -80px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem 1.5rem;
            flex-wrap: nowrap;
          }

          .nav-links {
            display: none;
          }

          .logo {
            font-size: 1.3rem;
          }

          .logo-text {
            display: block;
          }

          .logo-icon {
            width: 20px;
            height: 20px;
          }

          .footer {
            padding: 3rem 1.5rem;
          }

          .footer-container {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .footer-left {
            justify-content: center;
          }

          .footer-right {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .launch-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
          }

          .hero-badge {
            display: none;
          }

          .hero-content {
            order: 1;
          }

          .visual-container {
            order: 2;
            margin-bottom: 1rem;
          }

          .hero {
            padding: 9rem 1.5rem 2rem;
            gap: 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
            line-height: 1.2;
            margin-bottom: 2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 3rem;
          }

          .cta-section {
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 3rem;
          }

          .cta-primary,
          .cta-secondary {
            width: 100%;
            text-align: center;
            padding: 1rem 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 2rem 0;
          }

          .stat-value {
            font-size: 1.8rem;
          }

          .central-orb {
            width: 240px;
            height: 240px;
            font-size: 1.8rem;
          }

          .bound-logo {
            width: 260px;
            height: 260px;
          }

          .logo-container::after {
            font-size: 1.1rem;
            bottom: -2rem;
          }

          .ring-1 {
            width: 300px;
            height: 300px;
            top: -30px;
            left: -30px;
          }

          .ring-2 {
            width: 360px;
            height: 360px;
            top: -60px;
            left: -60px;
          }

          .floating-token {
            width: 45px;
            height: 45px;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .trusted {
            padding: 3rem 1.5rem;
          }

          .trusted-logos {
            gap: 1.5rem;
            justify-content: center;
          }

          .trusted-logo {
            font-size: 1rem;
          }

          .powered-by {
            left: 1.5rem;
            bottom: 1.5rem;
            font-size: 0.8rem;
            padding: 0.6rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 0.8rem 1rem;
          }

          .logo {
            font-size: 1.2rem;
          }

          .logo-icon {
            width: 18px;
            height: 18px;
          }

          .footer {
            padding: 2.5rem 1rem;
          }

          .footer-container {
            gap: 1.25rem;
          }

          .footer-text {
            font-size: 0.85rem;
          }

          .copyright {
            font-size: 0.85rem;
          }

          .social-link {
            width: 36px;
            height: 36px;
          }

          .launch-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }

          .hero {
            padding: 4rem 1rem 1.5rem;
            gap: 2rem;
          }

          .hero-title {
            font-size: 2rem;
            line-height: 1.2;
            margin-bottom: 1rem;
            margin-top: 30px;
          }

          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .hero-badge {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
            margin-bottom: 1rem;
          }

          .cta-section {
            margin-bottom: 2rem;
          }

          .cta-primary,
          .cta-secondary {
            padding: 0.9rem 1.2rem;
            font-size: 0.9rem;
          }

          .stats-grid {
            gap: 1rem;
            padding: 1rem 0;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .visual-container {
            min-height: 350px;
          }

          .central-orb {
            width: 200px;
            height: 200px;
            font-size: 1.5rem;
          }

          .bound-logo {
            width: 200px;
            height: 200px;
          }

          .logo-container::after {
            font-size: 1rem;
            bottom: -1.5rem;
          }

          .ring-1 {
            width: 260px;
            height: 260px;
            top: -30px;
            left: -30px;
          }

          .ring-2 {
            width: 320px;
            height: 320px;
            top: -60px;
            left: -60px;
          }

          .floating-token {
            width: 35px;
            height: 35px;
            font-size: 0.7rem;
            font-weight: 600;
          }

          .features {
            padding: 3rem 1rem;
          }

          .features-title {
            font-size: 1.8rem;
            margin-bottom: 0.8rem;
          }

          .features-subtitle {
            font-size: 0.95rem;
            margin-bottom: 2.5rem;
          }

          .feature-card {
            padding: 1.8rem 1.2rem;
          }

          .feature-icon {
            width: 45px;
            height: 45px;
            font-size: 1.2rem;
            margin-bottom: 1.2rem;
          }

          .feature-title {
            font-size: 1.1rem;
            margin-bottom: 0.8rem;
          }

          .feature-description {
            font-size: 0.9rem;
            line-height: 1.5;
          }

          .trusted {
            padding: 2.5rem 1rem;
          }

          .trusted-title {
            font-size: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .trusted-logos {
            gap: 1rem;
          }

          .trusted-logo {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .hero-title {
            font-size: 1.8rem;
          }

          .central-orb {
            width: 180px;
            height: 180px;
            font-size: 1.3rem;
          }

          .bound-logo {
            width: 160px;
            height: 160px;
          }

          .logo-container::after {
            font-size: 0.9rem;
            bottom: -1.2rem;
          }

          .ring-1 {
            width: 220px;
            height: 220px;
            top: -20px;
            left: -20px;
          }

          .ring-2 {
            width: 260px;
            height: 260px;
            top: -40px;
            left: -40px;
          }

          .floating-token {
            width: 30px;
            height: 30px;
            font-size: 0.6rem;
          }

          .features-title {
            font-size: 1.6rem;
          }

          .trusted-logos {
            flex-direction: column;
            gap: 0.8rem;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`navbar ${navbarScrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <img src="/favicon.png" alt="BOUND" className="logo-icon" />
          <span className="logo-text">BOUND</span>
        </div>
        <div className="nav-links"></div>
        <a
          target="_blank"
          href="https://app.boundprotocol.com"
          className="launch-btn"
        >
          Launch App
        </a>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>The DeFi Yield Stablecoin</span>
          </div>

          <h1 className="hero-title">
            The Future of Yield Strategies on Stables
          </h1>
          <p className="hero-subtitle">
            Diversified exposure to professional yield strategies across premium
            stablecoins. One token, complete coverage of the stable yield
            market.
          </p>

          <div className="cta-section">
            <a
              target="_blank"
              href="https://app.boundprotocol.com"
              className="cta-primary"
            >
              Start Earning
            </a>
            <Link href="/litepapers" className="cta-secondary">
              Docs
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">18.44%</div>
              <div className="stat-label">Current APY</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">$2.1B</div>
              <div className="stat-label">Total Value Locked</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">45K+</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
        </div>

        <div className="visual-container">
          <div className="central-orb">
            <div className="logo-container">
              <img
                src="/BNDTlogo.png"
                alt="BOUND Logo"
                className="bound-logo"
              />
            </div>
            <div className="orb-ring ring-1"></div>
            <div className="orb-ring ring-2"></div>
          </div>

          {/* Floating Tokens */}
          <div className="floating-token token-1">USDe</div>
          <div className="floating-token token-2">USDC</div>
          <div className="floating-token token-3">USDS</div>
          <div className="floating-token token-4">USD0</div>
          <div className="floating-token token-5">$</div>
          <div className="floating-token token-6">$</div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted">
        <div className="trusted-container">
          <div className="trusted-title">Trusted by</div>
          <div className="trusted-logos">
            <a
              href="https://enzyme.finance"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="trusted-logo">Enzyme</div>
            </a>
            <a
              href="https://microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="trusted-logo">Microsoft</div>
            </a>
            <a
              href="https://avantgarde.finance"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="trusted-logo">Avantgarde</div>
            </a>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="trusted-logo">Base</div>
            </a>
            <a
              href="https://yardhub.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="trusted-logo">YardHub</div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-left">
            <img src="/ioicon.png" alt="BOUND Logo" className="footer-logo" />
            <span className="footer-text">powered by IO INVESTMENT</span>
          </div>
          <div className="footer-right">
            <span className="copyright">
              © 2025 BOUND. All rights reserved.
            </span>
            <Link href="#" className="social-link">
              𝕏
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default NewPage;
