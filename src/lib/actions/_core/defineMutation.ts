import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { z } from "zod";
import {
  requireAdminSession,
  isDirector,
  type AdminRole,
  type AdminSession,
} from "@/lib/auth";

// ════════════════════════════════════════════════════════════════════
// defineMutation — factoriseur de server actions admin.
//
// Remplace le boilerplate répété (session guard → parse → role check →
// handler → revalidate) par une définition déclarative.
//
// Usage :
//   export const updateLeadStatus = defineMutation({
//     schema: z.object({ leadId: z.string().uuid(), status: z.enum([...]) }),
//     requiredRole: "advisor",
//     handler: async ({ input, session }) => { ... return { message } },
//     revalidate: ({ input }) => [`/admin/leads`, `/admin/leads/${input.leadId}`],
//   });
//
// Le résultat respecte la signature `useActionState` :
//   (prev: MutationState, formData: FormData) => Promise<MutationState>
// ════════════════════════════════════════════════════════════════════

export type MutationState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export interface MutationContext<TInput> {
  input: TInput;
  session: AdminSession;
}

export interface MutationHandlerResult {
  message: string;
}

export interface DefineMutationConfig<TSchema extends z.ZodTypeAny> {
  /** Schéma Zod qui valide le FormData reçu. */
  schema: TSchema;
  /** Rôle minimum requis. `advisor` = tout admin, `director` = seul le directeur. */
  requiredRole?: AdminRole;
  /**
   * Guard d'ownership custom — renvoyer null si l'utilisateur n'a pas le droit.
   * Exécuté APRÈS le parse Zod et le check de rôle.
   */
  guard?: (ctx: MutationContext<z.output<TSchema>>) => Promise<string | null>;
  /** Logique métier. Renvoie `{ message }` pour le toast. Jette pour une erreur. */
  handler: (ctx: MutationContext<z.output<TSchema>>) => Promise<MutationHandlerResult>;
  /** Paths à revalider après succès. Peut dépendre de l'input. */
  revalidate?: (ctx: MutationContext<z.output<TSchema>>) => string[];
  /** Message d'erreur générique custom (fallback). */
  errorMessage?: string;
  /** Nom pour les logs (facultatif mais recommandé). */
  name?: string;
}

export function defineMutation<TSchema extends z.ZodTypeAny>(
  config: DefineMutationConfig<TSchema>
) {
  return async (
    _prev: MutationState,
    formData: FormData
  ): Promise<MutationState> => {
    const actionName = config.name ?? "mutation";

    // 1. Session
    let session: AdminSession;
    try {
      session = await requireAdminSession();
    } catch {
      return {
        status: "error",
        message: "Session expirée. Reconnectez-vous.",
      };
    }

    // 2. Role check
    if (config.requiredRole === "director" && !isDirector(session)) {
      return {
        status: "error",
        message: "Action réservée au directeur.",
      };
    }

    // 3. Parse Zod
    const raw = Object.fromEntries(formData.entries());
    const parsed = config.schema.safeParse(raw);
    if (!parsed.success) {
      return {
        status: "error",
        message: "Le formulaire contient des erreurs.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const ctx: MutationContext<z.output<TSchema>> = {
      input: parsed.data,
      session,
    };

    // 4. Guard ownership
    if (config.guard) {
      const reason = await config.guard(ctx);
      if (reason) {
        return { status: "error", message: reason };
      }
    }

    // 5. Handler
    try {
      const result = await config.handler(ctx);

      // 6. Revalidate (après succès)
      if (config.revalidate) {
        const paths = config.revalidate(ctx);
        for (const path of paths) revalidatePath(path);
      }
      // Invalide le cache court (15s) des lectures admin taggées "admin" dans
      // db.ts. updateTag (Next 16) = read-your-own-writes en Server Action :
      // le conseiller voit sa modif immédiatement dans les listes.
      updateTag("admin");

      return { status: "success", message: result.message };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      console.error(`[${actionName}] handler error:`, msg);
      return {
        status: "error",
        message: config.errorMessage ?? `Impossible d'effectuer l'action (${msg})`,
      };
    }
  };
}
