import { Button } from "@/components/ui/button";

export function InvalidStaticClasses({ tone }: { tone: string }) {
  return <Button className={`bg-${tone}`}>Invalid dynamic classes</Button>;
}
