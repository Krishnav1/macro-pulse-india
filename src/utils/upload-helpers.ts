import { supabase } from '@/integrations/supabase/client';

/**
 * Check for existing dates and return only new records
 */
export async function filterNewRecords<T extends { date: string }>(
  tableName: string,
  records: T[]
): Promise<{ newRecords: T[]; existingCount: number }> {
  const dates = records.map(r => r.date);
  
  const { data: existing } = await (supabase as any)
    .from(tableName)
    .select('date')
    .in('date', dates);

  const existingDates = existing ? existing.map((e: any) => e.date) : [];
  const newRecords = records.filter(r => !existingDates.includes(r.date));

  return {
    newRecords,
    existingCount: existingDates.length,
  };
}

/**
 * Insert records in batches
 */
export async function batchInsert<T>(
  tableName: string,
  records: T[],
  batchSize: number = 100
): Promise<void> {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await (supabase as any)
      .from(tableName)
      .insert(batch);

    if (error) throw error;
  }
}
