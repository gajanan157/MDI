export interface EscalationPerson {
  name: string;
  phone?: string | null;
  email: string;
}
export interface EscalationRow {
  sr: number;
  query: string;
  queryId: string;
  contactPerson?: EscalationPerson;
  escalationLevel1?: EscalationPerson;
  escalationLevel2?: EscalationPerson;
  escalationLevel3?: EscalationPerson;
  escalationLevel4?: EscalationPerson;
}