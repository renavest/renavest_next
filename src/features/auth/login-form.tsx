"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function LoginForm({
  onSubmit,
}: {
  onSubmit?: (email: string, code: string[]) => void;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return email.endsWith("@companyemail.com");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description:
          "Please use your company email address (@companyemail.com)",
      });
      return;
    }

    if (code.some((digit) => !digit)) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter the complete 4-digit verification code",
      });
      return;
    }

    onSubmit?.(email, code);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 3 && inputs.current[index + 1]) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0 &&
      inputs.current[index - 1]
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = [...code];
    pastedData.split("").forEach((char, index) => {
      if (index < 4) newCode[index] = char;
    });
    setCode(newCode);
    const lastIndex = Math.min(pastedData.length - 1, 3);
    inputs.current[lastIndex]?.focus();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2 pb-8">
        <div className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your details to sign in to your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium inline-block">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@companyemail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-base bg-muted/50 focus:border-secondary"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-medium">Verification code</Label>
              <span className="text-xs text-secondary">
                Enter the 4-digit code
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  maxLength={1}
                  className="h-14 w-14 text-center text-lg font-semibold bg-muted/50 focus:border-secondary focus:bg-muted/30"
                  // @ts-ignore
                  ref={(el) => (inputs.current[index] = el)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  required
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 transition-all"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-6 text-center">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <div className="text-sm">
          Don't have a Renavest account?{" "}
          <Link
            href="/signup"
            className="text-secondary font-medium hover:text-secondary/80 transition-colors"
          >
            Sign up now
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
