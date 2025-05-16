
interface ServiceCategory {
  id: string;
  name: string;
  services: string[];
}

// Convert the JSON structure to a more usable format
export const formatServiceCategories = (jsonData: Record<string, string[]>): ServiceCategory[] => {
  return Object.entries(jsonData).map(([key, services]) => {
    // Convert the key from snake_case to a readable name
    const name = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return {
      id: key,
      name,
      services
    };
  });
};

export const getServiceOptions = (categories: ServiceCategory[]): { 
  label: string;
  value: string;
  category: string;
}[] => {
  const options: { label: string; value: string; category: string; }[] = [];
  
  categories.forEach(category => {
    category.services.forEach(service => {
      options.push({
        label: service,
        value: service,
        category: category.name
      });
    });
  });
  
  return options;
};

export const searchServices = (
  query: string,
  categories: ServiceCategory[]
): { 
  label: string;
  value: string;
  category: string;
}[] => {
  if (!query.trim()) return [];
  
  const options = getServiceOptions(categories);
  const lowerQuery = query.toLowerCase();
  
  return options.filter(
    option => 
      option.label.toLowerCase().includes(lowerQuery) ||
      option.category.toLowerCase().includes(lowerQuery)
  );
};
