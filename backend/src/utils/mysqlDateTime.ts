/**
 * MySQL DATETIME columns reject ISO-8601 strings like '2026-04-04T16:23:17.238Z'.
 * Use 'YYYY-MM-DD HH:MM:SS' (UTC wall time from the instant).
 */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toMysqlDateTime(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    return toMysqlDateTime(new Date());
  }
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

export function toMysqlDateTimeOrNull(input: unknown): string | null {
  if (input == null || input === '') return null;
  const d = input instanceof Date ? input : new Date(String(input));
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

/** For dynamic UPDATE sets: only touch known datetime column names. */
export function valueForMysqlDateTimeColumn(column: string, value: unknown): unknown {
  const dateCols = new Set(['submitted_at', 'processed_at', 'order_date', 'delivery_date']);
  if (!dateCols.has(column)) return value;
  if (value == null || value === '') return null;
  return toMysqlDateTime(value as string | number | Date);
}
