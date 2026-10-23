import { listConfirmations } from "@/actions/confirmations";
import ConfirmadosClient from "./ConfirmadosClient";

export const dynamic = "force-dynamic";

export default async function ConfirmadosPage() {
  const confirmations = await listConfirmations();
  return <ConfirmadosClient confirmations={confirmations} />;
}
