import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone";

describe("Dropzone", () => {
  it("renders empty state by default", () => {
    render(
      <Dropzone>
        <DropzoneEmptyState />
      </Dropzone>,
    );
    expect(screen.getByText("Upload a file")).toBeInTheDocument();
    expect(screen.getByText("Drag and drop or click to upload")).toBeInTheDocument();
  });

  it("renders custom empty state children", () => {
    render(
      <Dropzone>
        <DropzoneEmptyState>
          <p>Custom empty</p>
        </DropzoneEmptyState>
      </Dropzone>,
    );
    expect(screen.getByText("Custom empty")).toBeInTheDocument();
  });

  it("renders content when src is provided", () => {
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    render(
      <Dropzone src={[file]}>
        <DropzoneContent />
      </Dropzone>,
    );
    expect(screen.getByText("test.pdf")).toBeInTheDocument();
  });

  it("renders custom content children when src provided", () => {
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    render(
      <Dropzone src={[file]}>
        <DropzoneContent>
          <p>Custom content</p>
        </DropzoneContent>
      </Dropzone>,
    );
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });

  it("shows multiple files with 'and N more' label", () => {
    const files = [
      new File(["a"], "a.pdf", { type: "application/pdf" }),
      new File(["b"], "b.pdf", { type: "application/pdf" }),
      new File(["c"], "c.pdf", { type: "application/pdf" }),
      new File(["d"], "d.pdf", { type: "application/pdf" }),
    ];
    render(
      <Dropzone src={files}>
        <DropzoneContent />
      </Dropzone>,
    );
    expect(screen.getByText(/and 1 more/)).toBeInTheDocument();
  });

  it("shows file size constraints in empty state", () => {
    render(
      <Dropzone accept={{ "image/png": [".png"] }} maxSize={1048576}>
        <DropzoneEmptyState />
      </Dropzone>,
    );
    expect(screen.getByText(/Accepts.*png/)).toBeInTheDocument();
    expect(screen.getByText(/less than 1\.00MB/)).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(
      <Dropzone disabled>
        <DropzoneEmptyState />
      </Dropzone>,
    );
    const btn = container.querySelector("button");
    expect(btn).toBeDisabled();
  });

  it("renders hidden file input with accept attribute", async () => {
    const { container } = render(
      <Dropzone
        accept={{ "image/png": [".png"] }}
        maxSize={1}
      >
        <DropzoneEmptyState />
      </Dropzone>,
    );
    const input = container.querySelector("input[type='file']")!;
    expect(input).toBeInTheDocument();
    expect(input.getAttribute("accept")).toBe("image/png,.png");
  });
});
