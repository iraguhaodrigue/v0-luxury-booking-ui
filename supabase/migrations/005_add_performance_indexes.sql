-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS properties_status_idx ON public.properties(status);
CREATE INDEX IF NOT EXISTS cars_status_idx ON public.cars(status);
CREATE INDEX IF NOT EXISTS services_status_idx ON public.services(status);

-- Add created_at indexes for sorting
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS cars_created_at_idx ON public.cars(created_at DESC);
CREATE INDEX IF NOT EXISTS services_created_at_idx ON public.services(created_at DESC);

-- Add property_type index for filtering
CREATE INDEX IF NOT EXISTS properties_type_idx ON public.properties(property_type);

-- Analyze tables for query optimizer
ANALYZE public.properties;
ANALYZE public.cars;
ANALYZE public.services;
