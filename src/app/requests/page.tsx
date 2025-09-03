import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/request-card';
import { requestsData } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Request Board</h1>
          <p className="text-muted-foreground">
            Need help with a task? Post it for the community to see.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Post a Request
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {requestsData.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
