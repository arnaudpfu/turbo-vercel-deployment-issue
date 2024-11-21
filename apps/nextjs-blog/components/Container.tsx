import { Button } from '@internalpackage/components/ui';

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={'px-6 lg:px-8 ' + className}>
            <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
            <Button>Click me</Button>
        </div>
    );
}
