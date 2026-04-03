'use client';

import { Smartphone, QrCode } from 'lucide-react';
import { useLocaleStore } from '@/lib/store';

export default function AppDownloadBanner() {
  const locale = useLocaleStore(s => s.country.locale);

  const content: Record<string, { title: string; subtitle: string }> = {
    "pt-PT": { title: "Baixe a nossa App", subtitle: "Acesso exclusivo a ofertas e descontos" },
    "fr-FR": { title: "Téléchargez notre App", subtitle: "Accès exclusif aux offres et réductions" },
    "es-ES": { title: "Descarga nuestra App", subtitle: "Acceso exclusivo a ofertas y descuentos" },
    "de-DE": { title: "Laden Sie unsere App herunter", subtitle: "Exklusiver Zugang zu Angeboten" },
    "nl-NL": { title: "Download onze App", subtitle: "Exclusieve toegang tot aanbiedingen" },
    "pt-BR": { title: "Baixe nosso App", subtitle: "Acesso exclusivo a ofertas e descontos" },
    default: { title: "Download our App", subtitle: "Exclusive access to deals and discounts" },
  };

  const data = content[locale] || content["default"];

  return (
    <section className="py-8">
      <div className="bg-gray-900 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{data.title}</h2>
          <p className="text-sm text-gray-400 mb-4">{data.subtitle}</p>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-4 py-2.5 cursor-pointer transition-colors">
              <Smartphone className="h-5 w-5 text-white" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 leading-none">DISPONÍVEL NO</p>
                <p className="text-sm font-semibold text-white">Google Play</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-4 py-2.5 cursor-pointer transition-colors">
              <Smartphone className="h-5 w-5 text-white" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 leading-none">DOWNLOAD NA</p>
                <p className="text-sm font-semibold text-white">App Store</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 hidden md:flex flex-col items-center gap-3 bg-white/5 rounded-xl p-6">
          <div className="h-24 w-24 bg-white rounded-lg flex items-center justify-center">
            <QrCode className="h-16 w-16 text-gray-900" />
          </div>
          <p className="text-xs text-gray-400">Scan para download</p>
        </div>
      </div>
    </section>
  );
}
