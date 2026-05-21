import clsx from "clsx";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

export function BrandLogo({ className, imageClassName, textClassName }: BrandLogoProps) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <img
        src="/logo.png"
        alt="Midas Click"
        className={clsx("h-8 w-auto rounded-md object-contain", imageClassName)}
      />
      <span className={clsx("font-bold text-text-primary tracking-tight", textClassName)}>
        MidasClick
      </span>
    </span>
  );
}
