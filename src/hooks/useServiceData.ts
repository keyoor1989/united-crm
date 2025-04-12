
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ServiceCall, Engineer } from "@/types/service";
import { fetchEngineers, fetchServiceCalls } from "@/services/serviceDataService";
import { transformEngineersData, transformServiceCallsData, filterServiceCalls } from "@/utils/serviceDataUtils";

export const useServiceData = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceCallIdParam = searchParams.get('id');
  
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceCall, setSelectedServiceCall] = useState<ServiceCall | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadServiceData();
  }, []);
  
  useEffect(() => {
    if (serviceCallIdParam && serviceCalls.length > 0) {
      const serviceCall = serviceCalls.find(call => call.id === serviceCallIdParam);
      if (serviceCall) {
        setSelectedServiceCall(serviceCall);
        setShowDetailDialog(true);
      } else {
        toast({
          title: "Service Call Not Found",
          description: `Service call with ID ${serviceCallIdParam} was not found`,
          variant: "destructive",
        });
      }
    }
  }, [serviceCallIdParam, serviceCalls, toast]);
  
  const loadServiceData = async () => {
    await fetchServiceCallsData();
    await fetchEngineersData();
  };
  
  const fetchEngineersData = async () => {
    const { data, error } = await fetchEngineers();
    if (data && !error) {
      const transformedEngineers = transformEngineersData(data);
      setEngineers(transformedEngineers);
    }
  };
  
  const fetchServiceCallsData = async () => {
    setIsLoading(true);
    const { data, error } = await fetchServiceCalls();
    if (data && !error) {
      const transformedCalls = transformServiceCallsData(data);
      setServiceCalls(transformedCalls);
    }
    setIsLoading(false);
  };
  
  const handleShowDetails = (serviceCall: ServiceCall) => {
    setSelectedServiceCall(serviceCall);
    setShowDetailDialog(true);
  };
  
  const handleDialogClose = () => {
    setShowDetailDialog(false);
    if (serviceCallIdParam) {
      navigate('/service', { replace: true });
    }
  };
  
  const handleRefresh = () => {
    setSearchTerm("");
    loadServiceData();
    toast({
      title: "Refreshed",
      description: "Service calls and engineers have been refreshed",
    });
  };
  
  // Use the filter utility to get filtered calls
  const getFilteredCalls = (status: string) => {
    return filterServiceCalls(serviceCalls, status, searchTerm);
  };
  
  return {
    serviceCalls,
    engineers,
    searchTerm,
    selectedServiceCall,
    showDetailDialog,
    isLoading,
    pendingCalls: getFilteredCalls("pending"),
    inProgressCalls: getFilteredCalls("in progress"),
    completedCalls: getFilteredCalls("completed"),
    allCalls: getFilteredCalls("all"),
    setSearchTerm,
    setSelectedServiceCall,
    setShowDetailDialog,
    handleShowDetails,
    handleDialogClose,
    handleRefresh,
    fetchServiceCalls: fetchServiceCallsData,
    fetchEngineers: fetchEngineersData
  };
};
