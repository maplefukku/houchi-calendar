"use client"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

interface WelcomeProps {
  onStart: () => void
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-dvh flex-col items-center justify-center p-6"
    >
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            放置した日、見えてる？
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            毎日ひとつだけ答える。やったか、やらなかったか。
          </p>
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="default"
            className="h-12 rounded-full px-8 text-base"
            onClick={onStart}
          >
            始める
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
