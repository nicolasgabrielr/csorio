import { listGuests } from "@/actions/guests";
import { getConfirmedGuestIds } from "@/actions/confirmations";
import { getPrices } from "@/actions/prices";
import GuestsTable from "./GuestsTable";

export const dynamic = "force-dynamic";

export default async function InvitadosPage() {
  const [guests, confirmedIds, defaultPrices] = await Promise.all([
    listGuests(),
    getConfirmedGuestIds(),
    getPrices(),
  ]);

  const guestsWithStatus = guests.map(g => ({
    ...g,
    confirmed: confirmedIds.has(g.id),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-wedding-dark">Invitados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {guests.length} invitados en total
        </p>
      </div>
      <GuestsTable guests={guestsWithStatus} defaultPrices={defaultPrices} />
    </div>
  );
}
