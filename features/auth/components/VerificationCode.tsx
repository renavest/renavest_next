import React, { useRef } from "react";

interface VerificationCodeProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VerificationCode({
  value,
  onChange,
}: VerificationCodeProps) {
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleCodeChange = (index: number, digit: string) => {
    if (digit.length > 1) digit = digit.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newCode = value.split("");
    newCode[index] = digit;
    onChange(newCode.join(""));

    if (digit && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-between">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={codeRefs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-14 h-14 text-center text-lg rounded-lg border bg-background"
          value={value[i] || ""}
          onChange={(e) => handleCodeChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}
