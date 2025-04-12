
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Engineer {
  id: string;
  name: string;
}

export const useEngineers = () => {
  const { data: engineers = [], isLoading, error } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Engineer[];
    },
  });

  return { engineers, isLoading, error };
};
