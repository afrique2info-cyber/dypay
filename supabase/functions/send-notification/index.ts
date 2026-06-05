import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendNotificationRequest {
  merchant_id: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
  channels?: ("in_app" | "sms" | "whatsapp")[];
}

/**
 * Send SMS via Android SMS Gateway (free, open source)
 * Install "SMS Gateway" app on an Android phone (e.g. sms-gateway.app or github.com/nicxk1979/AndroidSMSServer)
 * The app exposes a local HTTP API that we call to send SMS through the phone's SIM card.
 *
 * Supported apps:
 *  - SMS Gateway (Play Store) - exposes REST API at http://<phone-ip>:8080
 *  - Android SMS Server (github) - same concept
 *
 * Env vars:
 *  ANDROID_SMS_GATEWAY_URL  - e.g. http://192.168.1.50:8080
 *  ANDROID_SMS_GATEWAY_KEY  - API key set in the SMS Gateway app (optional)
 */
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const gatewayUrl = Deno.env.get("ANDROID_SMS_GATEWAY_URL");
  const gatewayKey = Deno.env.get("ANDROID_SMS_GATEWAY_KEY");

  if (!gatewayUrl) {
    console.warn("ANDROID_SMS_GATEWAY_URL not configured - SMS not sent");
    return { success: false, error: "Android SMS Gateway not configured" };
  }

  try {
    const url = `${gatewayUrl.replace(/\/$/, "")}/sms`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (gatewayKey) {
      headers["Authorization"] = `Bearer ${gatewayKey}`;
    }

    // Format phone number (remove spaces, ensure + prefix)
    const formattedPhone = phone.replace(/\s/g, "").startsWith("+")
      ? phone.replace(/\s/g, "")
      : `+${phone.replace(/\s/g, "")}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        to: formattedPhone,
        message: `Dypay: ${message}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Android SMS Gateway error:", response.status, errorText);
      return { success: false, error: `SMS Gateway error: ${response.status}` };
    }

    console.log("SMS sent successfully to:", phone);
    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send WhatsApp message via CallMeBot (free)
 * CallMeBot allows sending WhatsApp messages for free.
 * Setup: send "I allow callmebot to send me messages" to +34 644 52 74 88 on WhatsApp
 * Then you'll receive an API key.
 *
 * Env vars:
 *  CALLMEBOT_API_KEY   - API key received from CallMeBot
 *
 * URL format: https://api.callmebot.com/whatsapp.php?phone=<phone>&text=<text>&apikey=<key>
 */
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const callmebotApiKey = Deno.env.get("CALLMEBOT_API_KEY");

  if (!callmebotApiKey) {
    console.warn("CALLMEBOT_API_KEY not configured - WhatsApp not sent");
    return { success: false, error: "CallMeBot not configured" };
  }

  try {
    const formattedPhone = phone.replace(/\s/g, "").replace("+", "");
    const encodedText = encodeURIComponent(`*Dypay*\n\n${message}`);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedText}&apikey=${callmebotApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CallMeBot error:", response.status, errorText);
      return { success: false, error: `CallMeBot error: ${response.status}` };
    }

    console.log("WhatsApp message sent successfully to:", phone);
    return { success: true };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendNotificationRequest = await req.json();
    const { merchant_id, title, message, type, data, channels } = body;

    if (!merchant_id || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: merchant_id, title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const defaultChannels = channels || ["in_app"];
    const results: Record<string, { success: boolean; error?: string }> = {};

    // Always create in-app notification
    if (defaultChannels.includes("in_app")) {
      const { error: notifError } = await supabase.from("merchant_notifications").insert({
        merchant_id,
        type: type || "payment",
        title,
        message,
        data: data || {},
        read: false,
      });

      results.in_app = notifError
        ? { success: false, error: notifError.message }
        : { success: true };
    }

    // Get merchant notification preferences
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("notification_phone, sms_notifications_enabled, whatsapp_notifications_enabled, default_currency")
      .eq("id", merchant_id)
      .maybeSingle();

    if (merchantError || !merchant) {
      console.warn("Merchant not found for notification:", merchant_id);
      return new Response(
        JSON.stringify({ success: true, results, warning: "Merchant not found for SMS/WhatsApp" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phone = merchant.notification_phone;

    // Send SMS via Android SMS Gateway if enabled
    if (defaultChannels.includes("sms") && merchant.sms_notifications_enabled && phone) {
      results.sms = await sendSMS(phone, message);
    } else if (defaultChannels.includes("sms") && !merchant.sms_notifications_enabled) {
      results.sms = { success: false, error: "SMS notifications disabled by merchant" };
    } else if (defaultChannels.includes("sms") && !phone) {
      results.sms = { success: false, error: "No phone number configured" };
    }

    // Send WhatsApp via CallMeBot if enabled
    if (defaultChannels.includes("whatsapp") && merchant.whatsapp_notifications_enabled && phone) {
      results.whatsapp = await sendWhatsApp(phone, `*${title}*\n\n${message}`);
    } else if (defaultChannels.includes("whatsapp") && !merchant.whatsapp_notifications_enabled) {
      results.whatsapp = { success: false, error: "WhatsApp notifications disabled by merchant" };
    } else if (defaultChannels.includes("whatsapp") && !phone) {
      results.whatsapp = { success: false, error: "No phone number configured" };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
