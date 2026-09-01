/**
 * M-Pesa Daraja API utility functions
 * Supports Safaricom Daraja 2.0
 */

const MPESA_BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const REQUIRED_MPESA_ENV_VARS = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORTCODE",
  "MPESA_PASSKEY",
];

function cleanBaseUrl(url) {
  return typeof url === "string" ? url.trim().replace(/\/+$/, "") : "";
}

export function getMpesaCallbackBaseUrl() {
  const explicitBaseUrl = cleanBaseUrl(process.env.MPESA_CALLBACK_BASE_URL);
  if (explicitBaseUrl) return explicitBaseUrl;

  const internalBaseUrl = cleanBaseUrl(process.env.NEXTAUTH_URL_INTERNAL);
  if (internalBaseUrl) return internalBaseUrl;

  return cleanBaseUrl(process.env.NEXTAUTH_URL);
}

export function validateMpesaConfig() {
  const missing = REQUIRED_MPESA_ENV_VARS.filter((key) => {
    const value = process.env[key];
    if (!value) return true;
    const normalized = value.toLowerCase();
    return normalized.includes("your_") || normalized.includes("replace");
  });

  const callbackBaseUrl = getMpesaCallbackBaseUrl();
  if (!callbackBaseUrl) missing.push("MPESA_CALLBACK_BASE_URL_OR_NEXTAUTH_URL");

  return {
    isValid: missing.length === 0,
    missing: [...new Set(missing)],
    callbackBaseUrl,
  };
}

/**
 * Get OAuth access token from Safaricom
 */
export async function getMpesaAccessToken() {
  const config = validateMpesaConfig();
  if (!config.isValid) {
    throw new Error(`M-Pesa configuration missing: ${config.missing.join(", ")}`);
  }
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to get M-Pesa access token: ${res.status} ${errorBody}`.trim());
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Generate the Base64-encoded password for STK push
 */
export function getMpesaPassword(timestamp) {
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
}

/**
 * Get current timestamp in YYYYMMDDHHmmss format
 */
export function getMpesaTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
}

/**
 * Format phone number to 254XXXXXXXXX
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("7") || cleaned.startsWith("1")) return "254" + cleaned;
  return cleaned;
}

/**
 * Initiate STK Push
 */
export async function initiateStkPush({ phone, amount, orderId }) {
  const config = validateMpesaConfig();
  if (!config.isValid) {
    throw new Error(`M-Pesa configuration missing: ${config.missing.join(", ")}`);
  }
  const accessToken = await getMpesaAccessToken();
  const timestamp = getMpesaTimestamp();
  const password = getMpesaPassword(timestamp);
  const formattedPhone = formatPhoneNumber(phone);

  if (!/^\d{12}$/.test(formattedPhone)) {
    throw new Error("Phone number must be in 2547XXXXXXXX format.");
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(numericAmount), // M-Pesa requires whole numbers
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${config.callbackBaseUrl}/api/mpesa/callback`,
    AccountReference: `TEATRFC-${orderId}`,
    TransactionDesc: "Tea-Terrific Bakery Order",
  };

  const res = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.errorMessage ||
      data?.ResponseDescription ||
      data?.errorCode ||
      `STK Push request failed with status ${res.status}`
    );
  }

  if (data?.ResponseCode !== "0") {
    throw new Error(data.ResponseDescription || "STK Push failed");
  }

  return data;
}
