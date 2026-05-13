import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import Image from "next/image";

export const metadata = {
  title: "SpartanFit | Home",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-white selection:bg-[#c22524] selection:text-white">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-20 px-4 sm:px-16 text-center relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#c22524] opacity-20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-900 opacity-20 rounded-full blur-[150px] pointer-events-none" />

        <div className="z-10 flex flex-col items-center gap-8 max-w-2xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            Desata tu <span className="text-[#c22524]">Potencial</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-lg">
            Spartanfit es tu entrenador personal guiado por IA, diseñado para
            hipertrofia, fuerza y rendimiento. Únete y empieza a medir tu
            progreso real hoy mismo.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <GoogleLoginButton />
            <p className="text-sm text-zinc-500 mt-4">
              Al iniciar sesión, aceptas nuestros términos y condiciones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
