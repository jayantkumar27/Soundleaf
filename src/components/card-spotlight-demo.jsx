import { Check } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

const steps = [
  "Enter your email address",
  "Create a strong password",
  "Set up two-factor authentication",
  "Verify your identity",
];

export default function CardSpotlightDemo() {
  return (
    <CardSpotlight className="h-96 w-96">
      <p className="relative z-20 mt-2 text-xl font-bold text-white">
        Authentication steps
      </p>
      <div className="relative z-20 mt-4 text-neutral-200">
        Follow these steps to secure your account:
        <ul className="mt-2 list-none">
          {steps.map((title) => (
            <li className="flex items-start gap-2" key={title}>
              <Check className="mt-1 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-white">{title}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative z-20 mt-4 text-sm text-neutral-300">
        Ensuring your account is properly secured helps protect your personal
        information and data.
      </p>
    </CardSpotlight>
  );
}
