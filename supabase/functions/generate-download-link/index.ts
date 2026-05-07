import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  download_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { download_id }: RequestBody = await req.json();

    if (!download_id) {
      return new Response(
        JSON.stringify({ error: "download_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get download record with product info
    const { data: download, error: downloadError } = await supabase
      .from("digital_downloads")
      .select(`
        *,
        product:products(
          id,
          name,
          digital_file_url,
          download_limit
        ),
        order:orders(
          customer_email
        )
      `)
      .eq("id", download_id)
      .single();

    if (downloadError || !download) {
      return new Response(
        JSON.stringify({ error: "Download not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if download has expired
    if (download.expires_at && new Date(download.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Download access has expired" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check download limit
    if (
      download.product.download_limit &&
      download.download_count >= download.product.download_limit
    ) {
      return new Response(
        JSON.stringify({ error: "Download limit reached" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate secure download token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "generate_download_token",
      { download_id }
    );

    if (tokenError || !tokenData) {
      throw new Error("Failed to generate download token");
    }

    // Create signed URL for file download (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("digital-products")
      .createSignedUrl(download.product.digital_file_url, 3600);

    if (signedUrlError || !signedUrlData) {
      throw new Error("Failed to generate signed URL");
    }

    // Update download count and last downloaded time
    await supabase
      .from("digital_downloads")
      .update({
        download_count: download.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", download_id);

    return new Response(
      JSON.stringify({
        download_url: signedUrlData.signedUrl,
        token: tokenData,
        product_name: download.product.name,
        downloads_remaining:
          download.product.download_limit
            ? download.product.download_limit - download.download_count - 1
            : null,
        expires_at: download.expires_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating download link:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
