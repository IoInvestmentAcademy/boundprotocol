export function Spinner(props: { className?: string }) {
  // get class name from props
  const className = props.className;
  return (
    <div
      className={`animate-spin rounded-full h-5 w-5 border-b-2 border-white ${className}`}
    ></div>
  );
}
