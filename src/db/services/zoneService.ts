import { getDatabase } from '../database';
import type { Zone, Table, ZoneWithTables } from '../types';

export const getAllZones = async (): Promise<Zone[]> => {
  const db = getDatabase();

  const result = await db.execute('SELECT * FROM zones ORDER BY id');

  return (result.rows || []) as unknown as Zone[];
};

export const getZonesByBusinessId = async (
  businessId: number,
): Promise<Zone[]> => {
  const db = getDatabase();

  const result = await db.execute(
    'SELECT * FROM zones WHERE business_id = ? ORDER BY id',
    [businessId],
  );

  return (result.rows || []) as unknown as Zone[];
};

export const getTablesByZoneId = async (zoneId: number): Promise<Table[]> => {
  const db = getDatabase();

  const result = await db.execute(
    'SELECT * FROM tables WHERE zone_id = ? ORDER BY id',
    [zoneId],
  );

  return (result.rows || []) as unknown as Table[];
};

export const getAllTablesWithZones = async (): Promise<ZoneWithTables[]> => {
  const zones = await getAllZones();

  const zonesWithTables = await Promise.all(
    zones.map(async zone => ({
      ...zone,
      tables: await getTablesByZoneId(zone.id),
    })),
  );

  return zonesWithTables;
};

export const updateTableStatus = async (
  tableId: number,
  status: 'empty' | 'active',
): Promise<void> => {
  const db = getDatabase();

  await db.execute('UPDATE tables SET status = ? WHERE id = ?', [
    status,
    tableId,
  ]);
};
