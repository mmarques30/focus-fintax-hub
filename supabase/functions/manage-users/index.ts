import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Allow service role key as bearer for bootstrap/seed operations
    const bearerToken = authHeader.replace("Bearer ", "");
    const isServiceRole = bearerToken === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!isServiceRole) {
      // Normal auth flow: verify JWT and check admin role
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(bearerToken);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const callerId = claimsData.claims.sub as string;

      const { data: roleCheck } = await serviceClient
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleCheck) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { email, password, full_name, cargo, role } = body;

      if (!email || !password || password.length < 6) {
        return new Response(
          JSON.stringify({ error: "Email e senha (mín. 6 caracteres) são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user with admin API (auto-confirms email)
      const { data: newUser, error: createErr } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || "" },
      });

      if (createErr) {
        return new Response(
          JSON.stringify({ error: createErr.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = newUser.user.id;

      // Update profile cargo if provided
      if (cargo) {
        await serviceClient
          .from("profiles")
          .update({ cargo })
          .eq("user_id", userId);
      }

      // Update role if not default 'cliente'
      if (role && role !== "cliente") {
        await serviceClient
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
        await serviceClient
          .from("user_roles")
          .insert({ user_id: userId, role });
      }

      return new Response(
        JSON.stringify({ success: true, user_id: userId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      const { user_id, full_name, cargo, role, current_role } = body;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: "user_id é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update profile
      await serviceClient
        .from("profiles")
        .update({ full_name, cargo })
        .eq("user_id", user_id);

      // Update role if changed
      if (role && role !== current_role) {
        await serviceClient
          .from("user_roles")
          .delete()
          .eq("user_id", user_id);
        await serviceClient
          .from("user_roles")
          .insert({ user_id, role });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use 'create' ou 'update'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
