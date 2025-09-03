import type { Request } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type RequestCardProps = {
  request: Request;
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{request.title}</CardTitle>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={request.user.avatar}
              alt={request.user.name}
              data-ai-hint="person"
            />
            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{request.user.name}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {request.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {request.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm font-semibold text-primary">
          Budget: ₹{request.budget.toLocaleString()}
        </div>
        <Button asChild>
          <Link href="/messages">Offer Help</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
