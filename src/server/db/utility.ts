import Knex from 'knex'

export const setupUpdatedAtFieldAutoUpdate = async (db: Knex) => {
  await db.raw(`
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';`)
}

export const updatedAtFieldAutoUpdate = async (db: Knex, tableName: string) => {
  await db.raw(`
    CREATE TRIGGER update_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
  `)
}
