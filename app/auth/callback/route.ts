import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseProjectRef, isSupabaseConfigured } from "@/lib/supabase/config";

function getAppOrigin(request: NextRequest) {
  const url = request.nextUrl;
  const isLocal = url.protocol === "http:" && url.hostname === "localhost" && url.port === "3000";
  const isProduction =
    url.protocol === "https:" && url.hostname === "newsseed.vercel.app" && url.port === "";

  return isLocal || isProduction ? url.origin : null;
}

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function callbackFailure(appOrigin: string, reason: string) {
  const url = new URL("/", appOrigin);
  url.searchParams.set("auth_error", "oauth_callback");
  if (process.env.NODE_ENV === "development") url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

function authErrorDetails(error: unknown) {
  const candidate = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
  return {
    name: typeof candidate?.name === "string" ? candidate.name : "UnknownError",
    message: typeof candidate?.message === "string" ? candidate.message : "Unknown authentication error",
    status: typeof candidate?.status === "number" ? candidate.status : null,
    code: typeof candidate?.code === "string" ? candidate.code : null,
  };
}

export async function GET(request: NextRequest) {
  const appOrigin = getAppOrigin(request);
  if (!appOrigin) {
    console.error("[NewsSeed][OAuth][A:origin] Callback origin is not allowed.", {
      requestOrigin: request.nextUrl.origin,
    });
    return new Response("Invalid OAuth callback origin", { status: 400 });
  }

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const flowId = params.get("sb_flow_id");
  const providerError = params.get("error");
  const providerErrorCode = params.get("error_code");
  const providerErrorDescription = params.get("error_description");
  const next = safeNextPath(params.get("next"));
  const pkceCookieNames = request.cookies.getAll()
    .map(cookie => cookie.name)
    .filter(name => name.startsWith("sb-") && name.includes("auth-token"));
  const serverProjectRef = getSupabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (providerError || providerErrorCode || providerErrorDescription) {
    console.error("[NewsSeed][OAuth][A:provider-callback] Provider returned an error.", {
      error: providerError,
      errorCode: providerErrorCode,
      errorDescription: providerErrorDescription,
    });
    return callbackFailure(appOrigin, "provider_error");
  }

  if (!code) {
    console.error("[NewsSeed][OAuth][B:code] Authorization code is missing.");
    return callbackFailure(appOrigin, "missing_code");
  }
  if (!isSupabaseConfigured()) {
    console.error("[NewsSeed][OAuth][B:code] Supabase environment is not configured.");
    return callbackFailure(appOrigin, "missing_configuration");
  }

  // Bind auth cookie writes to the exact redirect response returned to the browser.
  const successResponse = NextResponse.redirect(`${appOrigin}${next}`);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([name, value]) => {
            successResponse.headers.set(name, value);
          });
        },
      },
    },
  );

  if (process.env.NODE_ENV === "development") {
    console.info("[NewsSeed][OAuth][C:exchange] Callback diagnostics.", {
      requestOrigin: request.nextUrl.origin,
      requestHost: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
      hasCode: Boolean(code),
      hasPkceCodeVerifierCookie: pkceCookieNames.some(name => name.includes("code-verifier")),
      supabaseAuthCookieNames: pkceCookieNames,
      serverProjectRef,
      hasMatchingProjectPkceCookie: Boolean(
        serverProjectRef && pkceCookieNames.some(name => name.startsWith(`sb-${serverProjectRef}-auth-token`)),
      ),
      redirectDestination: `${appOrigin}${next}`,
    });
  }

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (exchangeError) {
    console.error("[NewsSeed][OAuth][C:exchange] Code exchange failed.", authErrorDetails(exchangeError));
    return callbackFailure(appOrigin, "exchange_failed");
  }

  console.info("[NewsSeed][OAuth][C:exchange] Code exchange succeeded.", {
    hasSession: Boolean(exchangeData.session),
    hasUser: Boolean(exchangeData.user),
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error("[NewsSeed][OAuth][D:get-user] Authenticated user validation failed.", authErrorDetails(userError));
    return callbackFailure(appOrigin, "user_validation_failed");
  }
  console.info("[NewsSeed][OAuth][D:get-user] Authenticated user validated.", {
    userIdPresent: Boolean(userData.user.id),
    provider: userData.user.app_metadata.provider ?? null,
  });

  let redirectPath = next;
  if (next === "/") {
    const { data: profile, error: profileError } = await supabase
      .from("user_learning_state")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[NewsSeed][OAuth][E:profile] Profile lookup failed; treating user as new.", {
        code: profileError.code,
        message: profileError.message,
      });
      redirectPath = "/onboarding";
    } else {
      redirectPath = profile ? "/" : "/onboarding";
      console.info("[NewsSeed][OAuth][E:profile] Profile lookup completed.", {
        hasProfile: Boolean(profile),
      });
    }
  }

  successResponse.headers.set("location", `${appOrigin}${redirectPath}`);
  console.info("[NewsSeed][OAuth][F:redirect] Redirecting authenticated user.", { redirectPath });

  return successResponse;
}
