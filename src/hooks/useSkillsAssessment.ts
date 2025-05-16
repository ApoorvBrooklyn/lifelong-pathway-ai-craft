import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/providers/SessionProvider";
import { useToast } from "@/components/ui/use-toast";

interface SkillData {
  name: string;
  value: number;
  color?: string;
}

export function useSkillsAssessment() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<SkillData[]>([]);

  // Fetch user skills
  const fetchSkills = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedSkills = data.map(skill => ({
          name: skill.name,
          value: skill.value,
          color: skill.color
        }));
        setSkills(formattedSkills);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast({
        title: "Error",
        description: "Failed to load skills data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a skill
  const saveSkill = async (skill: SkillData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save skills",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if skill exists
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", skill.name)
        .single();
        
      if (existingSkill) {
        // Update existing skill
        const { error } = await supabase
          .from("skills")
          .update({
            value: skill.value,
            color: skill.color,
            updated_at: new Date()
          })
          .eq("id", existingSkill.id);
          
        if (error) throw error;
      } else {
        // Insert new skill
        const { error } = await supabase
          .from("skills")
          .insert({
            user_id: user.id,
            name: skill.name,
            value: skill.value,
            color: skill.color
          });
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedSkills = [...skills];
      const skillIndex = updatedSkills.findIndex(s => s.name === skill.name);
      
      if (skillIndex >= 0) {
        updatedSkills[skillIndex] = skill;
      } else {
        updatedSkills.push(skill);
      }
      
      setSkills(updatedSkills);
      
      toast({
        title: "Success",
        description: `${skill.name} skill updated successfully`,
      });
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        title: "Error",
        description: "Failed to save skill data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save multiple skills at once
  const saveMultipleSkills = async (skillsToSave: SkillData[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save skills",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get existing skills to determine updates vs inserts
      const { data: existingSkills, error: fetchError } = await supabase
        .from("skills")
        .select("id, name")
        .eq("user_id", user.id);
        
      if (fetchError) throw fetchError;
      
      const existingSkillsMap = new Map();
      existingSkills?.forEach(skill => {
        existingSkillsMap.set(skill.name, skill.id);
      });
      
      // Prepare upserts
      const upserts = skillsToSave.map(skill => ({
        id: existingSkillsMap.get(skill.name) || undefined,
        user_id: user.id,
        name: skill.name,
        value: skill.value,
        color: skill.color || "#3182CE", // Default color
        updated_at: new Date()
      }));
      
      // Perform upsert operation
      const { error } = await supabase
        .from("skills")
        .upsert(upserts, { 
          onConflict: 'id', 
          ignoreDuplicates: false 
        });
        
      if (error) throw error;
      
      // Update local state
      setSkills(skillsToSave);
      
      toast({
        title: "Success",
        description: "Skills assessment saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving skills:", error);
      toast({
        title: "Error",
        description: "Failed to save skills assessment",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    skills,
    loading,
    fetchSkills,
    saveSkill,
    saveMultipleSkills
  };
} 