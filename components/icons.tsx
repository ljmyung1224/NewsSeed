import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
function Icon({ size = 20, children, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}
export const FlameIcon = (props: IconProps) => <Icon {...props}><path d="M12 22c4.2 0 7-3 7-7.2 0-3-1.7-5.8-5.1-8.6.1 2.2-.7 3.7-2 4.6.2-4.2-2-6.8-4.3-8.8.3 3.6-2.6 6-2.6 10.8C5 18.2 8 22 12 22Z"/><path d="M9.5 18c0-2.2 1.3-3.4 2.6-4.7.2 1.5 1 2.3 1.8 3.1.5.5.7 1 .7 1.6 0 1.5-1.1 2.5-2.6 2.5S9.5 19.5 9.5 18Z"/></Icon>;
export const BoltIcon = (props: IconProps) => <Icon {...props}><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></Icon>;
export const ArrowIcon = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>;
export const BackIcon = (props: IconProps) => <Icon {...props}><path d="m15 18-6-6 6-6"/></Icon>;
export const CheckIcon = (props: IconProps) => <Icon {...props}><path d="m20 6-11 11-5-5"/></Icon>;
export const ClockIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const BookIcon = (props: IconProps) => <Icon {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M8 7h8M8 11h6"/></Icon>;
export const LockIcon = (props: IconProps) => <Icon {...props}><rect width="15" height="11" x="4.5" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon>;
export const CloseIcon = (props: IconProps) => <Icon {...props}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
