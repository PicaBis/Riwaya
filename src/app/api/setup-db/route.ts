import { NextRequest, NextResponse } from "next/server";

const DDL = `
CREATE TABLE IF NOT EXISTS public.ratings (
  user_key   text        NOT NULL,
  novel_id   text        NOT NULL,
  stars      int         NOT NULL CHECK (stars BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_key, novel_id)
);
CREATE INDEX IF NOT EXISTS ratings_novel_idx ON public.ratings (novel_id);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ratings_public_read" ON public.ratings;
CREATE POLICY "ratings_public_read" ON public.ratings FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.activation_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  novel_id   text,
  used       boolean NOT NULL DEFAULT false,
  used_by    text,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activation_codes_code_idx ON public.activation_codes (code);
CREATE INDEX IF NOT EXISTS activation_codes_used_by_idx ON public.activation_codes (used_by) WHERE used = true;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activation_codes_public_read" ON public.activation_codes;
CREATE POLICY "activation_codes_public_read" ON public.activation_codes FOR SELECT USING (true);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'ratings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
  END IF;
END $$;
`;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.SETUP_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbPassword = request.headers.get("x-db-password") || process.env.DATABASE_PASSWORD;
  if (!dbPassword) {
    return NextResponse.json({ error: "DATABASE_PASSWORD required" }, { status: 400 });
  }

  const ref = "xkbgvxtuiecyvifqwwmq";
  const region = "eu-west-1";
  const connStr = `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 10000 });
    await client.connect();

    const statements = DDL.split(";").map((s) => s.trim()).filter(Boolean);
    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        results.push(`OK: ${stmt.slice(0, 60)}...`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push(`SKIP: ${msg.slice(0, 80)}`);
      }
    }

    await client.end();
    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
