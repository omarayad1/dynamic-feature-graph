
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Save, Undo, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchStrategyConfig, updateStrategyConfig, generateMockStrategyConfig } from "@/lib/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define types for form values
type FormValues = {
  name: string;
  enabled: boolean;
  [key: string]: string | number | boolean;
};

const StrategySettings: React.FC = () => {
  const [useMockData, setUseMockData] = useState(true);
  
  // Query to fetch strategy data
  const { 
    data: strategy, 
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['strategy-details'],
    queryFn: useMockData ? generateMockStrategyConfig : fetchStrategyConfig,
  });

  // Try to connect to real API after component mounts
  React.useEffect(() => {
    if (useMockData) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/strategy');
          if (response.ok) {
            setUseMockData(false);
            refetch();
          }
        } catch (error) {
          console.log("API not available, using mock data");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [useMockData, refetch]);

  // Create schema based on the strategy parameters
  const createFormSchema = (strategy: any) => {
    if (!strategy || !strategy.parameters) return z.object({});
    
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    Object.entries(strategy.parameters).forEach(([key, param]: [string, any]) => {
      if (param.type === "number") {
        schemaFields[key] = z.number()
          .min(param.min || -Infinity)
          .max(param.max || Infinity);
      } else if (param.type === "boolean") {
        schemaFields[key] = z.boolean();
      } else {
        schemaFields[key] = z.string();
      }
    });
    
    // Add the enabled field separately
    schemaFields.enabled = z.boolean();
    schemaFields.name = z.string().min(1, "Strategy name is required");
    
    return z.object(schemaFields);
  };

  // Use an explicit type for the form schema
  const formSchema = React.useMemo(() => createFormSchema(strategy), [strategy]);
  
  // Create form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: React.useMemo(() => {
      if (!strategy) return {};
      
      const values: Record<string, any> = {
        name: strategy.name,
        enabled: strategy.enabled
      };
      
      Object.entries(strategy.parameters).forEach(([key, param]: [string, any]) => {
        values[key] = param.value;
      });
      
      return values as FormValues;
    }, [strategy]),
  });
  
  // Reset form when strategy data changes
  React.useEffect(() => {
    if (strategy) {
      const values: Record<string, any> = {
        name: strategy.name,
        enabled: strategy.enabled
      };
      
      Object.entries(strategy.parameters).forEach(([key, param]: [string, any]) => {
        values[key] = param.value;
      });
      
      form.reset(values as FormValues);
    }
  }, [strategy, form]);
  
  // Mutation to update strategy
  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Transform data to match the API format
      const transformedData = {
        ...strategy,
        name: data.name,
        enabled: data.enabled,
        parameters: { ...strategy.parameters }
      };
      
      // Update parameter values
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'enabled' && transformedData.parameters[key]) {
          transformedData.parameters[key].value = value;
        }
      });
      
      return updateStrategyConfig(transformedData);
    },
    onSuccess: () => {
      toast.success("Strategy settings updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update strategy settings", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
        <NavBar />
        <main className="container py-8 px-4 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Strategy Settings</h1>
          </div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
        <NavBar />
        <main className="container py-8 px-4 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Strategy Settings</h1>
          </div>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Error Loading Strategy
              </CardTitle>
              <CardDescription>
                There was a problem loading the strategy configuration. Please try again later.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => refetch()}>Retry</Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <NavBar />
      <main className="container py-8 px-4 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Strategy Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your trading bot strategy parameters</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              disabled={updateMutation.isPending}
            >
              <Undo className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle>Strategy Configuration</CardTitle>
                </div>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strategy Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your trading strategy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Strategy Active
                          </FormLabel>
                          <FormDescription>
                            Enable or disable the trading strategy
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Strategy Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(strategy.parameters).map(([key, param]: [string, any]) => {
                      if (param.type === "number") {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={key}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                    min={param.min}
                                    max={param.max}
                                    step={param.step || 0.01}
                                  />
                                </FormControl>
                                <FormDescription>
                                  {param.description}
                                  {param.min !== undefined && param.max !== undefined && (
                                    <span className="block text-xs">
                                      Range: {param.min} to {param.max}
                                    </span>
                                  )}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      } else if (param.type === "boolean") {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={key}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </FormLabel>
                                  <FormDescription>
                                    {param.description}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        );
                      } else {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={key}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  {param.description}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Last updated: {strategy.lastUpdated}
                </p>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default StrategySettings;
