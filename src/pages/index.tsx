import Head from "next/head";
import Link from "next/link";

export default function Home() {
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

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px] opacity-30 z-0 pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] px-6 sm:px-10 py-5 flex justify-between items-center bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
            ∞
          </div>
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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-base font-bold">
              $
            </div>
            <span className="text-white">BOUND</span>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-2 rounded-full font-bold text-lg">
              18.44% APY
            </div>
          </div>
        </div>

        {/* 3D Globe Visualization */}
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] z-[1] hidden md:block">
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.3),rgba(139,92,246,0.1),transparent)] relative animate-[rotate_20s_linear_infinite]">
            <div className="absolute inset-5 rounded-full bg-[linear-gradient(45deg,transparent,rgba(139,92,246,0.1)),repeating-linear-gradient(0deg,transparent,transparent_10px,rgba(139,92,246,0.1)_12px),repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(139,92,246,0.1)_12px)]"></div>
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_2px_2px,rgba(139,92,246,0.8)_1px,transparent_1px)] bg-[length:40px_40px] animate-[pulse_3s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </main>

      {/* Partners Section */}
      <section className="py-20 px-6 sm:px-10 text-center relative z-[2]">
        <h2 className="text-lg text-gray-400 mb-10 font-normal">Trusted by</h2>
        <div className="flex justify-center items-center gap-8 sm:gap-16 flex-wrap max-w-6xl mx-auto">
          <div className="opacity-60 hover:opacity-100 transition-opacity text-2xl font-medium text-white">
            enzyme
          </div>
          <div className="opacity-60 hover:opacity-100 transition-opacity text-2xl font-medium text-white">
            Microsoft
          </div>
          <div className="opacity-60 hover:opacity-100 transition-opacity text-2xl font-medium text-white">
            AVANTGARDE
          </div>
          <div className="opacity-60 hover:opacity-100 transition-opacity text-2xl font-medium text-white">
            Chainlink
          </div>
          <div className="opacity-60 hover:opacity-100 transition-opacity text-2xl font-medium text-white">
            yard[hub]
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 sm:px-10 border-t border-white/10 relative z-[2]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-base text-gray-400">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">
              ∞
            </div>
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
    </>
  );
}
