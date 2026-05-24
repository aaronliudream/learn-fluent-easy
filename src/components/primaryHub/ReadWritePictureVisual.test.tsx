import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import ReadWritePictureVisual from "./ReadWritePictureVisual";
import { BUILTIN_READWRITE_PICTURE_VISUALS } from "@/lib/primaryHub/readWriteTypes";

describe("ReadWritePictureVisual", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each(BUILTIN_READWRITE_PICTURE_VISUALS)(
    "renders built-in visual %s inside frame",
    (visual) => {
      render(<ReadWritePictureVisual visual={visual} alt={`alt for ${visual}`} />);
      expect(screen.getByLabelText(`alt for ${visual}`)).toBeInTheDocument();
    },
  );

  it("renders place_books with legacy Unit 1 copy", () => {
    render(<ReadWritePictureVisual visual="place_books" alt="Books on shelves" />);
    expect(screen.getByText("📚 Books")).toBeInTheDocument();
  });

  it("renders external image mode with img alt", () => {
    render(
      <ReadWritePictureVisual
        image="/primary/hub/g4v2_u1/library.svg"
        alt="School library illustration"
      />,
    );
    const img = screen.getByRole("img", { name: "School library illustration" });
    expect(img).toHaveAttribute("src", "/primary/hub/g4v2_u1/library.svg");
  });

  it("prefers image over visual when both props are passed", () => {
    render(
      <ReadWritePictureVisual
        visual="place_books"
        image="/primary/hub/g4v2_u2/clock.svg"
        alt="Clock at eight"
      />,
    );
    expect(screen.getByRole("img", { name: "Clock at eight" })).toBeInTheDocument();
    expect(screen.queryByText("📚 Books")).not.toBeInTheDocument();
  });

  it("shows alt fallback when neither visual nor image is provided", () => {
    render(<ReadWritePictureVisual alt="Missing illustration" />);
    expect(screen.getByText("Missing illustration")).toBeInTheDocument();
    expect(screen.getByText("🖼️")).toBeInTheDocument();
  });

  it("falls back to alt text when image fails to load", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ReadWritePictureVisual image="/does-not-exist.svg" alt="Broken image alt" />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Broken image alt" }));
    expect(screen.getByText("Broken image alt")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Failed to load readWrite image"));
  });
});
