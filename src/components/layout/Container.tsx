import { cn } from "@/lib/utils";

export type ContainerProps = React.ComponentProps<"div"> & {
  /** Coloana îngustă, pentru text lung. Implicit e cea largă, pentru grile. */
  ingust?: boolean;
};

/** Singurul loc unde se decid lățimea maximă și spațierea laterală a paginii. */
export function Container({ className, ingust = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6", ingust ? "max-w-3xl" : "max-w-6xl", className)}
      {...props}
    />
  );
}
