"use server";

import { createClient } from "@/utils/supabase/server";
import { UserService } from "@/lib/services/user.service";
import { UpdateUserProfileDTO } from "@/lib/types/user.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfileAction(data: UpdateUserProfileDTO) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  // Basic validation for activity index
  if (data.activityIndex !== undefined && data.activityIndex !== null) {
    if (data.activityIndex < 1 || data.activityIndex > 10) {
      throw new Error("El índice de actividad debe estar entre 1 y 10");
    }
  }

  // If trying to set a role, verify if the user already has one.
  const dbUser = await UserService.getUserProfile(user.id);
  if (data.roleId && dbUser?.roleId) {
    throw new Error("El rol ya fue asignado previamente y no puede ser modificado.");
  }

  await UserService.updateUserProfile(user.id, data);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function suspendAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No estás autenticado");
  }

  await UserService.suspendUserAccount(user.id);
  
  // Sign out user
  await supabase.auth.signOut();
  redirect("/?suspended=true");
}
