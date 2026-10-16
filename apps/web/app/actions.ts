"use server";

import { spawn } from "node:child_process";

export interface ShutdownActionState {
  ok: boolean;
  message: string;
}

/**
 * Comandos PowerShell que encerram API (3000), Web (3001) e o serviço
 * PostgreSQL. A Web atual deve ser a última a morrer — por isso a ação
 * dispara um processo filho *detached* com um pequeno atraso, garantindo
 * que a resposta HTTP chegue ao navegador antes do encerramento.
 *
 * Importante: **não fecha o navegador**. Encerra apenas:
 * - processos escutando nas portas 3000/3001 (API e Web) e
 * - janelas de console do projeto (processo `cmd`) cujo título contenha
 *   "Comic Tracker".
 */
function shutdownPowerShell(): string {
  return [
    "Get-NetTCPConnection -LocalPort 3000,3001 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }",
    "Get-Process | Where-Object { $_.ProcessName -eq 'cmd' -and $_.MainWindowTitle -like '*Comic Tracker*' } | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }",
    "$s = Get-Service postgresql-x64-18 -ErrorAction SilentlyContinue; if ($s -and $s.Status -eq 'Running') { Stop-Service postgresql-x64-18 -Force -ErrorAction SilentlyContinue }",
  ].join("; ");
}

/**
 * Encerra o projeto local (API, Web e PostgreSQL).
 *
 * O processo filho é desanexado (`detached`) e não é aguardado, para que a
 * resposta chegue ao navegador antes de o servidor Next.js ser encerrado.
 * Ao parar o serviço do PostgreSQL com acesso de administrador (herdado
 * quando o projeto foi iniciado pelos scripts .bat), a ação funciona sem
 * novo pedido de elevação.
 */
export async function shutdownProject(): Promise<ShutdownActionState> {
  const childScript = [
    'const { execFileSync } = require("node:child_process");',
    "setTimeout(() => {",
    "  try {",
    `    execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ${JSON.stringify(shutdownPowerShell())}], { stdio: "ignore", windowsHide: true });`,
    "  } catch {",
    "    // a Web já caiu junto com o encerramento; nada a reportar",
    "  }",
    "}, 1500);",
  ].join("\n");

  const child = spawn(process.execPath, ["-e", childScript], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();

  return { ok: true, message: "Projeto encerrando..." };
}
