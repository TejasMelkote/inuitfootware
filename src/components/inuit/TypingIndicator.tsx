export function TypingIndicator() {
  return (
    <div className="animate-fade-in flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-taupe/50"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "1.1s" }}
        />
      ))}
      <span className="label-caps ml-2 text-[0.625rem]">Concierge is typing</span>
    </div>
  );
}
