export type ButtonProps = {
  className?: string
  size?: "sm" | "lg"
  children?: unknown
}

export function Button({ className, children }: ButtonProps) {
  return (
    <button
      className={
        "rounded-md bg-primary px-4 py-2 text-primary-foreground " +
        (className ?? "")
      }
    >
      {children}
    </button>
  )
}
