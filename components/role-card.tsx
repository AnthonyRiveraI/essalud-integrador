"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoleCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  variant?: "default" | "destructive"
}

export function RoleCard({ title, description, icon: Icon, onClick, variant = "default" }: RoleCardProps) {
  const isDestructive = variant === "destructive"

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105",
        isDestructive && "bg-destructive text-destructive-foreground border-destructive/20 hover:border-destructive",
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center">
        <div
          className={cn(
            "mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
            isDestructive ? "bg-destructive-foreground/10" : "bg-primary/10 group-hover:bg-primary/20",
          )}
        >
          <Icon className={cn("w-8 h-8", isDestructive ? "text-destructive-foreground" : "text-primary")} />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className={cn("text-balance", isDestructive && "text-destructive-foreground/90")}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" variant={isDestructive ? "secondary" : "default"}>
          {isDestructive ? "Atención Inmediata" : "Ingresar"}
        </Button>
      </CardContent>
    </Card>
  )
}
