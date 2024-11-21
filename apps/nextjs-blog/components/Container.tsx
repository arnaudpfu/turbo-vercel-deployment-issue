import { cn } from '@internalpackage/utils';
import { Button } from '@internalpackage/components/ui';

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn(className, 'px-6 lg:px-8')}>
            <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
            <Button>Click me</Button>
        </div>
    );
}
