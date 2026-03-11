import fs from "fs/promises";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "config.json");

interface Config {
  storagePath: string;
}

const DEFAULT_PATH_WINDOWS = "C:\\Tufibra_Fotos";
const DEFAULT_PATH_LINUX = "/var/tufibra_fotos";

export async function getConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const defaultPath = process.platform === "win32" ? DEFAULT_PATH_WINDOWS : DEFAULT_PATH_LINUX;
    return { storagePath: process.env.EXTERNAL_STORAGE_PATH || defaultPath };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function getStoragePath(): Promise<string> {
  const config = await getConfig();
  return config.storagePath;
}
