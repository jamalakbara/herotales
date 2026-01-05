"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CharacterBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

const hairColors = [
  { label: "Black", value: "black hair", color: "#1a1a1a" },
  { label: "Brown", value: "brown hair", color: "#8B4513" },
  { label: "Blonde", value: "blonde hair", color: "#F4D03F" },
  { label: "Red", value: "red hair", color: "#C0392B" },
  { label: "Auburn", value: "auburn hair", color: "#A0522D" },
];

const skinTones = [
  { label: "Light", value: "light skin", color: "#FFE4C4" },
  { label: "Fair", value: "fair skin", color: "#F5DEB3" },
  { label: "Medium", value: "medium skin tone", color: "#D2B48C" },
  { label: "Olive", value: "olive skin", color: "#C4A776" },
  { label: "Tan", value: "tan skin", color: "#B8860B" },
  { label: "Brown", value: "brown skin", color: "#8B7355" },
  { label: "Dark", value: "dark skin", color: "#5D4E37" },
];

const hairStyles = [
  { label: "Short", value: "short" },
  { label: "Long", value: "long" },
  { label: "Curly", value: "curly" },
  { label: "Wavy", value: "wavy" },
  { label: "Straight", value: "straight" },
  { label: "Braided", value: "braided" },
];

const eyeColors = [
  { label: "Brown", value: "brown eyes", color: "#8B4513" },
  { label: "Blue", value: "blue eyes", color: "#4169E1" },
  { label: "Green", value: "green eyes", color: "#228B22" },
  { label: "Hazel", value: "hazel eyes", color: "#8E7618" },
];

export function CharacterBuilder({ value, onChange }: CharacterBuilderProps) {
  const [hairColor, setHairColor] = useState("");
  const [hairStyle, setHairStyle] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [eyeColor, setEyeColor] = useState("");

  const updateDescription = (
    newHairColor?: string,
    newHairStyle?: string,
    newSkinTone?: string,
    newEyeColor?: string
  ) => {
    const parts = [];

    const hc = newHairColor ?? hairColor;
    const hs = newHairStyle ?? hairStyle;
    const st = newSkinTone ?? skinTone;
    const ec = newEyeColor ?? eyeColor;

    if (st) parts.push(st);
    if (hs && hc) parts.push(`${hs} ${hc}`);
    else if (hc) parts.push(hc);
    if (ec) parts.push(ec);

    const description = parts.length > 0
      ? `A child with ${parts.join(", ")}`
      : "";

    onChange(description);
  };

  return (
    <div className="space-y-6 p-4 rounded-2xl bg-white/50 border border-border/50">
      {/* Hair Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hair Color</label>
        <div className="flex flex-wrap gap-2">
          {hairColors.map((color) => (
            <motion.button
              key={color.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setHairColor(color.value);
                updateDescription(color.value, undefined, undefined, undefined);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                hairColor === color.value
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-sm">{color.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hair Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hair Style</label>
        <div className="flex flex-wrap gap-2">
          {hairStyles.map((style) => (
            <motion.button
              key={style.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setHairStyle(style.value);
                updateDescription(undefined, style.value, undefined, undefined);
              }}
              className={cn(
                "px-3 py-2 rounded-xl border-2 text-sm transition-all",
                hairStyle === style.value
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {style.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Skin Tone</label>
        <div className="flex flex-wrap gap-2">
          {skinTones.map((tone) => (
            <motion.button
              key={tone.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSkinTone(tone.value);
                updateDescription(undefined, undefined, tone.value, undefined);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                skinTone === tone.value
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: tone.color }}
              />
              <span className="text-sm">{tone.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Eye Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Eye Color</label>
        <div className="flex flex-wrap gap-2">
          {eyeColors.map((color) => (
            <motion.button
              key={color.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEyeColor(color.value);
                updateDescription(undefined, undefined, undefined, color.value);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                eyeColor === color.value
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <div
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: color.color }}
              />
              <span className="text-sm">{color.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-sage/10 border border-sage/20"
        >
          <p className="text-sm font-medium text-sage-dark mb-1">
            ✨ Character Preview
          </p>
          <p className="text-sm text-foreground">{value}</p>
        </motion.div>
      )}
    </div>
  );
}
