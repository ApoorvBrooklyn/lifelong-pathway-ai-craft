import { supabase } from "./client";
import type { Database } from "./types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// User Profiles
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Courses
export const getRecommendedCourses = async (userId: string) => {
  // This is where you would implement the logic to get personalized recommendations
  // For now, we'll return mock data
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .limit(6);
  
  if (error) throw error;
  return data;
};

// Skills
export const getUserSkills = async (userId: string) => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", userId);
  
  if (error) throw error;
  return data;
};

export const updateUserSkill = async (skillId: string, value: number) => {
  const { data, error } = await supabase
    .from("skills")
    .update({ value })
    .eq("id", skillId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Career Progress
export const getCareerProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("career_paths")
    .select("*")
    .eq("user_id", userId);
  
  if (error) throw error;
  return data;
}; 