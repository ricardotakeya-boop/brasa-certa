export type FamilyRateGuest = {
  id: string;
  name: string;
  family: string;
  type: "adult" | "child";
};

export type GuestCharge = FamilyRateGuest & { amount: number };

export type FamilyCharge = {
  family: string;
  members: string[];
  total: number;
};

export function calculateFamilyRate({
  guests,
  adults,
  children,
  perAdult,
  perChild,
}: {
  guests: FamilyRateGuest[];
  adults: number;
  children: number;
  perAdult: number;
  perChild: number;
}) {
  const guestCharges: GuestCharge[] = guests.map((guest) => ({
    ...guest,
    amount: guest.type === "child" ? perChild : perAdult,
  }));
  const familyMap = new Map<string, FamilyCharge>();

  guestCharges.forEach((guest) => {
    const family = guest.family.trim() || "Sem família";
    const key = family.toLocaleLowerCase("pt-BR");
    const current = familyMap.get(key) ?? { family, members: [], total: 0 };
    current.members.push(guest.name);
    current.total += guest.amount;
    familyMap.set(key, current);
  });

  const namedAdults = guests.filter((guest) => guest.type === "adult").length;
  const namedChildren = guests.filter((guest) => guest.type === "child").length;
  const unassignedAdults = Math.max(0, adults - namedAdults);
  const unassignedChildren = Math.max(0, children - namedChildren);
  const familyCharges = Array.from(familyMap.values());

  if (unassignedAdults || unassignedChildren) {
    familyCharges.push({
      family: "Convidados ainda não nomeados",
      members: [
        ...(unassignedAdults ? [`${unassignedAdults} adulto(s)`] : []),
        ...(unassignedChildren ? [`${unassignedChildren} criança(s)`] : []),
      ],
      total: unassignedAdults * perAdult + unassignedChildren * perChild,
    });
  }

  return {
    guestCharges,
    familyCharges,
    namedAdults,
    namedChildren,
    unassignedAdults,
    unassignedChildren,
  };
}
