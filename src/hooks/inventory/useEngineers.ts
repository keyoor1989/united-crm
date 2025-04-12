
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Engineer } from "@/types/service";

export const useEngineers = () => {
  const { data: engineers = [], isLoading, error } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineers')
        .select('id, name, phone, email, location, status, skill_level, current_job, current_location')
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to match the expected Engineer interface
      const transformedData = data.map(engineer => ({
        id: engineer.id,
        name: engineer.name,
        phone: engineer.phone,
        email: engineer.email,
        location: engineer.location,
        status: engineer.status,
        skillLevel: engineer.skill_level,
        currentJob: engineer.current_job,
        currentLocation: engineer.current_location,
      }));
      
      return transformedData as Engineer[];
    },
  });

  return { engineers, isLoading, error };
};
