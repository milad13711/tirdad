// Known SMS trigger events wired into the app's real flows (see
// dispatchSmsTrigger() call sites). Admins can also type a custom eventKey
// in the trigger form for scenarios not wired yet — the trigger just won't
// fire until some code path calls dispatchSmsTrigger() with that key.
export const SMS_TRIGGER_EVENTS = [
  {
    key: "ORDER_PAID",
    label: "پرداخت موفق سفارش (دوره، پرامپت، اشتراک)",
    vars: ["name", "itemLabel", "amount"],
  },
  {
    key: "LEAD_CREATED",
    label: "ثبت لید یا درخواست آنالیز پیج",
    vars: ["name"],
  },
] as const;
