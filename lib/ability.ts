import { Ability, AbilityBuilder } from "@casl/ability";

export const GROUPS: Record<number, string> = {
  1: "root",
  2: "superAdmin",
  3: "admin",
  4: "cliente",
};

export function defineAbilities(groupId: number) {
  const role = GROUPS[groupId] || "cliente";
  const { can, rules } = new AbilityBuilder(Ability);

  switch (role) {
    case "root":
      can("manage", "all");
      break;
    case "superAdmin":
      can("manage", ["Dashboard", "Users", "Clients"]);
      break;
    case "admin":
      can("read", ["Dashboard", "Users", "Clients"]);
      can("update", ["Project"]);
      break;
    case "cliente":
      can("read", "Dashboard");
      break;
  }

  return new Ability(rules);
}
