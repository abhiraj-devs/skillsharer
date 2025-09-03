import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { servicesData } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Services</h1>
          <p className="text-muted-foreground">
            Browse and discover skills offered by fellow students.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Post a Service
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servicesData.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
