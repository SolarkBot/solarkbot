import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-white/[0.68] sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
