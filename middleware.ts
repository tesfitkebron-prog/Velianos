import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accesAutorise } from "@/lib/subscription";

const protectedPaths = [
  "/dashboard",
  "/assistant",
  "/messages",
  "/notifications",
  "/clients",
  "/parametres",
  "/compte",
  "/onboarding",
  "/entreprise",
  "/abonnement",
];

function estCheminProtege(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

async function aAccesAbonnement(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<boolean | null> {
  try {
    const { data: profil, error: erreurProfil } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (erreurProfil || !profil?.company_id) return null;

    const { data: entreprise, error: erreurEntreprise } = await supabase
      .from("companies")
      .select("subscription_status, subscription_plan, trial_ends_at")
      .eq("id", profil.company_id)
      .maybeSingle();

    if (erreurEntreprise || !entreprise) return null;

    return accesAutorise(
      entreprise.subscription_status as string | null,
      entreprise.subscription_plan as string | null,
      entreprise.trial_ends_at as string | null,
    );
  } catch {
    // En cas d'erreur réseau, on ne bloque pas l'accès.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = estCheminProtege(pathname);

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    const avaitJeton = request.cookies
      .getAll()
      .some(
        ({ name }) => name.startsWith("sb-") && name.includes("auth-token"),
      );
    if (avaitJeton) {
      loginUrl.searchParams.set("session", "expired");
    }

    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && (isProtected || pathname === "/abonnement")) {
    const acces = await aAccesAbonnement(supabase, user.id);

    if (acces === false && pathname !== "/abonnement") {
      return NextResponse.redirect(new URL("/abonnement", request.url));
    }

    if (acces === true && pathname === "/abonnement") {
      return NextResponse.redirect(new URL("/compte/abonnement", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
