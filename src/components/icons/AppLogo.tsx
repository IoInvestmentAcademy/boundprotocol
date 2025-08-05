export const AppLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 2L29.856 24H2.144L16 2Z"
      fill="url(#gradient)"
      stroke="#8B5CF6"
      strokeWidth="2"
    />
    <circle cx="16" cy="16" r="6" fill="#8B5CF6" />
    <defs>
      <linearGradient
        id="gradient"
        x1="16"
        y1="2"
        x2="16"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C4B5FD" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
); 