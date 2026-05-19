import { redirect } from "next/navigation";

export default async function StatesRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const state = params?.state;

  if (!state) {
    redirect("/");
  }

  redirect(`/states/${state}`);
}