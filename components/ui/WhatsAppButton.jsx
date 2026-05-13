"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const phoneNumber = "233543636510";
const defaultMessage = "Hello Velttech, I would like to enquire about your services.";
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

export default function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Velttech on WhatsApp"
      initial={{ opacity: 0, scale: 0.82, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed bottom-6 left-6 z-50 grid size-14 place-items-center rounded-full bg-accent text-dark shadow-lg shadow-slate-900/20 transition focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-light"
    >
      <MessageCircle size={27} aria-hidden="true" />
    </motion.a>
  );
}
