import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostnames permitidos no modo dev (proteção anti DNS rebinding).
  // `comic.local` é o hostname amigável usado pelos scripts
  // iniciar-comic-tracker.bat / parar-comic-tracker.bat (arquivo hosts).
  // `127.0.0.1` cobre o acesso direto pelo IP quando o servidor é
  // iniciado com `--hostname 127.0.0.1` (IPv4).
  allowedDevOrigins: ["comic.local", "127.0.0.1", "localhost"],
};

export default nextConfig;
