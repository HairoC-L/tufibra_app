import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  let title = "Tu Fibra Digital";
  let faviconUrl = "/tufibra_logo.webp";
  
  try {
    const { prisma } = await import("@/lib/prisma");
    const empresa = await prisma.empresa.findFirst();
    if (empresa?.nombre) title = empresa.nombre;
    if (empresa?.favicon_url) faviconUrl = `/api/media/${empresa.favicon_url}`;
  } catch (error) {
    console.error("Error fetching empresa for metadata:", error);
  }

  return {
    title,
    description: "Sistema para gestionar órdenes de trabajo",
    generator: 'Hairo',
    icons: {
      icon: faviconUrl
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      
      <body className={inter.className}>{children}
        <ToastContainer />
      </body>
    </html>
  )
}
