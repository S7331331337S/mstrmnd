import { DiscountStudio } from "@/components/shopify/discount-studio";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function DiscountPage({ params, searchParams }: {
  params: Promise<{ discount?: string[] }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { discount = ["new"] } = await params;
  const path = discount.join("/");
  const demo = (await searchParams).demo === "1";
  if (path !== "new" && !/^\d+$/.test(path) && !/^gid:\/\/shopify\/(DiscountNode|DiscountAutomaticNode)\/\d+$/.test(path)) notFound();
  return <DiscountStudio demo={demo} id={path === "new" ? undefined : path}
    clientId={process.env.SHOPIFY_CLIENT_ID ?? ""} />;
}
