"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleLogout } from "../../auth/utils/auth";
interface FloatingHeaderProps {
  title: string;
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({ title }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 
        z-50
        transition-all duration-300 ease-in-out
        bg-white py-6 px-20
        ${isScrolled ? "shadow-md" : "shadow-lg"}`}
    >
      <div 
        style={{ maxWidth: '1500px' }}
        className="flex mx-auto">
        <div 
          className="flex">
          <Image
            className="mr-4"
            src="/renavestlogo.avif"
            alt="Renavest Logo"
            width={50}
            height={50}/>
          <h1
            className={`
              text-2xl font-semibold
              transition-all duration-300
              text-gray-800
            `}>
            {title}
          </h1>
        </div>
        <div className="flex flex-1"/>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex items-center gap-2 hover:bg-gray-100">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default FloatingHeader;
