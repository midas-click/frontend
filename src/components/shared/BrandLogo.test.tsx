import { render, screen } from "@testing-library/react";

import { BrandLogo } from "./BrandLogo";

// Renders the shared logo image and brand name together.
test("BrandLogo renders image and MidasClick wordmark", () => {
  render(<BrandLogo />);

  expect(screen.getByAltText("Midas Click")).toHaveAttribute("src", "/logo.png");
  expect(screen.getByText("MidasClick")).toBeInTheDocument();
});

// Applies caller-provided classes to the wrapper, image, and text nodes.
test("BrandLogo merges custom class names", () => {
  const { container } = render(
    <BrandLogo className="brand-root" imageClassName="brand-image" textClassName="brand-text" />,
  );

  expect(container.firstChild).toHaveClass("brand-root");
  expect(screen.getByAltText("Midas Click")).toHaveClass("brand-image");
  expect(screen.getByText("MidasClick")).toHaveClass("brand-text");
});
