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

export const setupBase64IdGenerator = async (db: Knex) => {
  await db.raw(`
  CREATE OR REPLACE FUNCTION generate_b64id()
  RETURNS text AS $$
  DECLARE
    id TEXT;
    a bytea;
    b bytea;
  BEGIN
    -- Generate replacement characters for / and +
    a := gen_random_bytes(1);
    b := gen_random_bytes(1);
    a := set_byte(a, 0, get_byte(a, 0) & 240::int);
    b := set_byte(b, 0, get_byte(b, 0) & 240::int);

    -- Generate id and replace unsafe characters
    id := encode(gen_random_bytes(12), 'base64');
    id := replace(id, '/', left(encode(a, 'base64'), 1));
    id := replace(id, '+', left(encode(b, 'base64'), 1));
    RETURN id;
  END;
  $$ language 'plpgsql';
  `)
}
