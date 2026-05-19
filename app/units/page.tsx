import { redirect } from "next/navigation";

export default async function UnitsRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const unit = params?.unit;

  if (!unit) {
    redirect("/");
  }

  redirect(`/units/${unit}`);
}