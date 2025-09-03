import type { Service } from '@/lib/data';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Link from 'next/link';

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          className="object-cover"
          data-ai-hint="abstract"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-headline text-lg line-clamp-2">
            {service.title}
          </CardTitle>
          {service.rating > 0 && (
            <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={service.user.avatar}
              alt={service.user.name}
              data-ai-hint="person"
            />
            <AvatarFallback>{service.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {service.user.name}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{service.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
        <div className="text-lg font-bold">
          <span className="text-xs font-normal text-muted-foreground">
            FROM{' '}
          </span>
          ₹{service.price.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/messages">Exchange</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/messages">Buy</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
