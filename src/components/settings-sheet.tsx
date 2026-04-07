"use client"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: {
    notifyEnabled: boolean
    notifyTime: string
    theme: "light" | "dark" | "system"
  }
  onSettingsChange: (settings: Partial<SettingsSheetProps["settings"]>) => void
  onDeleteData: () => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onDeleteData,
}: SettingsSheetProps) {
  function handleDeleteData() {
    const confirmed = window.confirm(
      "すべてのデータを削除しますか？この操作は取り消せません。"
    )
    if (confirmed) {
      onDeleteData()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl transition-transform duration-300"
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="flex flex-col gap-4 p-6">
          {/* Drag handle */}
          <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/20" />

          <SheetHeader className="p-0">
            <SheetTitle className="text-lg font-semibold">設定</SheetTitle>
          </SheetHeader>

          {/* 通知 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">通知</span>
              <Switch
                checked={settings.notifyEnabled}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ notifyEnabled: checked })
                }
              />
            </div>
            {settings.notifyEnabled && (
              <input
                type="time"
                value={settings.notifyTime}
                onChange={(e) =>
                  onSettingsChange({ notifyTime: e.target.value })
                }
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            )}
          </div>

          <Separator />

          {/* テーマ */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">テーマ</span>
            <div className="flex gap-2">
              {(
                [
                  { value: "light", label: "ライト" },
                  { value: "dark", label: "ダーク" },
                  { value: "system", label: "自動" },
                ] as const
              ).map(({ value, label }) => (
                <motion.div key={value} whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button
                    variant={settings.theme === value ? "secondary" : "ghost"}
                    className="w-full rounded-full"
                    onClick={() => onSettingsChange({ theme: value })}
                  >
                    {label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* データ削除 */}
          <div className="flex flex-col gap-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                className="w-full rounded-full"
                onClick={handleDeleteData}
              >
                すべてのデータを削除
              </Button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
