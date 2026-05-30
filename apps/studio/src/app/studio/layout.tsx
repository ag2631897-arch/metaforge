import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudioShell } from "./studio-shell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth?callbackUrl=/studio/apps");
  }

  return <StudioShell>{children}</StudioShell>;
}
