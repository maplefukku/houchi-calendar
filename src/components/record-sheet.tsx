"use client"

import { motion } from "framer-motion"

import { formatJapaneseDate } from "@/lib/calendar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface RecordSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  onRecord: (value: "yes" | "no") => void
}

export function RecordSheet({
  open,
  onOpenChange,
  date,
  onRecord,
}: RecordSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl transition-transform duration-300"
        style={{
          transitionTimingFunction:
            "cubic-bezier(0.22, 1, 0.36, 1)" /* spring-like: stiffness 400, damping 30 */,
        }}
      >
        <div className="flex flex-col gap-4 p-6">
          {/* Drag handle */}
          <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/20" />

          <SheetHeader className="p-0">
            <SheetDescription className="text-sm text-muted-foreground">
              {formatJapaneseDate(date)}
            </SheetDescription>
            <SheetTitle className="text-xl font-semibold">
              今日、自分の未来のために何かやった？
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className="h-14 w-full rounded-full"
                onClick={() => onRecord("yes")}
              >
                やった
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="h-14 w-full rounded-full"
                onClick={() => onRecord("no")}
              >
                やらなかった
              </Button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
