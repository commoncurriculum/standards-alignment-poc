import { serve } from "https://deno.land/std@0.170.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0"
import "https://deno.land/x/xhr@0.2.1/mod.ts"
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts"

const supabaseClient = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const standard_id = url.searchParams.get("standard_id")
  const jurisdiction_id = url.searchParams.get("jurisdiction_id")
  const count = parseInt(url.searchParams.get("count") || "20") || 20

  try {
    // Grab a connection from the pool
    const connection = await pool.connect()

    try {
      /*
       *****************************************************************************************************
       * Find Source Standard
       *****************************************************************************************************
       */

      let fields_to_select = [
        "id",
        "description",
        "jurisdiction_id",
        "jurisdiction_title",
        "list_id",
        "position",
        "standard_set_id",
        "standard_set_title",
        "standard_set_status",
        "statement_notation",
        "subject",
        "ancestor_ids",
      ].join(", ")

      const { data: source_standard, error } = await supabaseClient
        .from("standards")
        .select(fields_to_select)
        .eq("id", standard_id)

      /*
       *****************************************************************************************************
       * Find Matched standards
       *****************************************************************************************************
       */
      const result = await connection.queryObject`
        with embedding as (
          select embeddings
          from standards
          where id = ${standard_id}
        )

        select
          standards.id,
          standards.description,
          standards.jurisdiction_id,
          standards.jurisdiction_title,
          standards.list_id,
          standards.position,
          standards.standard_set_id,
          standards.statement_notation,
          standards.standard_set_title,
          standards.standard_set_status,
          standards.subject,
          standards.ancestor_ids,
          1 - (standards.embeddings <=> embedding.embeddings) as similarity
        from standards, embedding
        where
          standards.jurisdiction_id = ${jurisdiction_id} and
          standards.embeddings <=> embedding.embeddings < 1 - 0.25
        order by standards.embeddings <=> embedding.embeddings
        limit ${count};
      `

      const matched_standards = result.rows

      /*
       *****************************************************************************************************
       * Construct Response
       *****************************************************************************************************
       */

      let res = {
        matching_from:
          source_standard && source_standard.length > 0
            ? {
                jurisdiction_id: source_standard[0].jurisdiction_id,
                jurisdiction_title: source_standard[0].jurisdiction_title,
                standard: source_standard[0],
              }
            : null,
        matching_to:
          matched_standards && matched_standards.length > 0
            ? {
                jurisdiction_id: jurisdiction_id,
                jurisdiction_title: matched_standards[0].jurisdiction_title,
                matched_standards: matched_standards,
              }
            : null,
      }

      return new Response(JSON.stringify(res), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })

      /*
       *****************************************************************************************************
       * Handle errors and clean up
       *****************************************************************************************************
       */
    } finally {
      // Release the connection back into the pool
      connection.release()
    }
  } catch (err) {
    console.error(err)
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/match_standard' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
