"use client";

import { SectionCard } from "./section-card";
import { RedeemQueueTable, type RedeemQueueItem } from "./redeem-queue-table";
import { AffiliateQueueTable } from "./affiliate-queue-table";
import type { AffiliateQueueItem, AffiliateVerificationItem } from "@/lib/queries/affiliates";
import type { ManualCashbackQueueItem } from "@/lib/queries/transactions";

interface CashbackQueuesTabProps {
  redeemQueue: RedeemQueueItem[];
  affiliateQueue: AffiliateQueueItem[];
  verificationQueue: AffiliateVerificationItem[];
  manualPendingQueue: ManualCashbackQueueItem[];
}

export function CashbackQueuesTab({
  redeemQueue,
  affiliateQueue,
  verificationQueue,
  manualPendingQueue,
}: CashbackQueuesTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Kolejka wniosków o konto"
        description="Zatwierdzaj, realizuj lub odrzucaj zgłoszenia użytkowników dotyczące wymiany punktów na konto fundowane."
      >
        <RedeemQueueTable transactions={redeemQueue} />
      </SectionCard>

      <SectionCard
        title="Weryfikacja transakcji afiliacyjnych"
        description="Sprawdź zgłoszenia afiliacyjne, uzupełnij punkty i zatwierdź lub odrzuć wypłatę."
      >
        <AffiliateQueueTable
          items={affiliateQueue}
          verificationItems={verificationQueue}
          manualPendingItems={manualPendingQueue}
        />
      </SectionCard>
    </div>
  );
}


