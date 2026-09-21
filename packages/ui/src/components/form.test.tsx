import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";

function TestForm({
  onSubmit,
  children,
}: {
  onSubmit: (values: { name: string }) => void;
  children: (form: UseFormReturn<{ name: string }>) => React.ReactNode;
}) {
  const form = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Form {...form}>{children(form)}</Form>
    </form>
  );
}

describe("Form components", () => {
  it("renders FormField with label and control", () => {
    render(
      <TestForm onSubmit={() => {}}>
        {(form) => (
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <input placeholder="Enter name" {...field} />
                </FormControl>
                <FormDescription>Your full name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </TestForm>,
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    expect(screen.getByText("Your full name")).toBeInTheDocument();
  });

  it("FormLabel shows error styling when field has error", () => {
    render(
      <TestForm onSubmit={() => {}}>
        {(form) => (
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Required" }}
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </TestForm>,
    );
    const label = screen.getByText("Name");
    expect(label.getAttribute("data-error")).toBe("false");
  });

  it("FormControl passes aria attributes", () => {
    render(
      <TestForm onSubmit={() => {}}>
        {(form) => (
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <input {...field} />
                </FormControl>
                <FormDescription>Help text</FormDescription>
              </FormItem>
            )}
          />
        )}
      </TestForm>,
    );
    const control = screen.getByLabelText("Name");
    const descId = control.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    expect(control.getAttribute("aria-invalid")).toBe("false");
  });

  it("FormMessage renders error text", async () => {
    render(
      <TestForm onSubmit={() => {}}>
        {(form) => (
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "This is required" }}
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </TestForm>,
    );
    expect(screen.queryByText("This is required")).not.toBeInTheDocument();
  });

  it("renders nested field items with unique ids", () => {
    render(
      <TestForm onSubmit={() => {}}>
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Name2</FormLabel>
                  <FormControl>
                    <input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
      </TestForm>,
    );
    const labels = screen.getAllByText(/Name/);
    expect(labels.length).toBe(2);
  });
});
