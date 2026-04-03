'use client';

import { Facebook, Instagram, Youtube, Linkedin, Mail, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { COUNTRIES, FOOTER_LINKS, CURRENCY_SYMBOLS } from '@/lib/constants';
import { useLocaleStore } from '@/lib/store';
import { useState } from 'react';

const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/actionstores' },
  { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/actionstores' },
  { icon: Youtube, label: 'YouTube', url: 'https://youtube.com/actionstores' },
  { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/action-stores' },
];

export default function Footer() {
  const locale = useLocaleStore(s => s.country.locale);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sobre = FOOTER_LINKS.sobre[locale] || FOOTER_LINKS.sobre['pt-PT'];
  const ajuda = FOOTER_LINKS.ajuda[locale] || FOOTER_LINKS.ajuda['pt-PT'];
  const servicos = FOOTER_LINKS.servicos[locale] || FOOTER_LINKS.servicos['pt-PT'];

  const colTitles: Record<string, Record<string, string>> = {
    sobre: { "pt-PT": "Sobre a Action", "fr-FR": "À propos d'Action", "es-ES": "Sobre Action", "it-IT": "Chi è Action", "nl-NL": "Over Action", "de-DE": "Über Action", "fr-BE": "À propos", "lb-LU": "Iwwer Action", "pt-BR": "Sobre a Action" },
    ajuda: { "pt-PT": "Ajuda & Contacto", "fr-FR": "Aide & Contact", "es-ES": "Ayuda & Contacto", "it-IT": "Aiuto & Contatti", "nl-NL": "Hulp & Contact", "de-DE": "Hilfe & Kontakt", "fr-BE": "Aide & Contact", "lb-LU": "Hëllef & Kontakt", "pt-BR": "Ajuda & Contato" },
    servicos: { "pt-PT": "Serviços", "fr-FR": "Services", "es-ES": "Servicios", "it-IT": "Servizi", "nl-NL": "Diensten", "de-DE": "Dienstleistungen", "fr-BE": "Services", "lb-LU": "Servicer", "pt-BR": "Serviços" },
    paises: { "pt-PT": "Países", "fr-FR": "Pays", "es-ES": "Países", "it-IT": "Paesi", "nl-NL": "Landen", "de-DE": "Länder", "fr-BE": "Pays", "lb-LU": "Länner", "pt-BR": "Países" },
    newsletter: { "pt-PT": "Newsletter", "fr-FR": "Newsletter", "es-ES": "Boletín", "it-IT": "Newsletter", "nl-NL": "Nieuwsbrief", "de-DE": "Newsletter", "fr-BE": "Newsletter", "lb-LU": "Newsletter", "pt-BR": "Newsletter" },
    nlPlaceholder: { "pt-PT": "O seu email...", "fr-FR": "Votre email...", "es-ES": "Tu email...", "it-IT": "La tua email...", "nl-NL": "Uw e-mail...", "de-DE": "Ihre E-Mail...", "fr-BE": "Votre email...", "lb-LU": "Är Email...", "pt-BR": "Seu email..." },
    nlButton: { "pt-PT": "Subscrever", "fr-FR": "S'abonner", "es-ES": "Suscribirse", "it-IT": "Iscriversi", "nl-NL": "Aanmelden", "de-DE": "Anmelden", "fr-BE": "S'abonner", "lb-LU": "Abonnéieren", "pt-BR": "Inscrever-se" },
    nlSuccess: { "pt-PT": "Subscrito com sucesso!", "fr-FR": "Inscrit avec succès!", "es-ES": "¡Suscrito con éxito!", "it-IT": "Iscritto con successo!", "nl-NL": "Succesvol aangemeld!", "de-DE": "Erfolgreich angemeldet!", "fr-BE": "Inscrit!", "lb-LU": "Erfollegrich abonnéiert!", "pt-BR": "Inscrito com sucesso!" },
    downloadApp: { "pt-PT": "Baixe a nossa App", "fr-FR": "Téléchargez notre App", "es-ES": "Descarga nuestra App", "it-IT": "Scarica la nostra App", "nl-NL": "Download onze App", "de-DE": "Laden Sie unsere App herunter", "fr-BE": "Téléchargez notre App", "lb-LU": "Luet eis App erof", "pt-BR": "Baixe nosso App" },
  };

  const t = (key: string) => colTitles[key]?.[locale] || colTitles[key]?.['pt-PT'] || key;

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('sobre')}</h3>
            <ul className="space-y-2">
              {sobre.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('ajuda')}</h3>
            <ul className="space-y-2">
              {ajuda.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('servicos')}</h3>
            <ul className="space-y-2">
              {servicos.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('newsletter')}</h3>
            <p className="text-sm text-gray-400 mb-3">
              {locale === 'pt-PT' ? 'Receba as melhores ofertas no seu email' : locale === 'fr-FR' ? 'Recevez les meilleures offres par email' : locale === 'de-DE' ? 'Erhalten Sie die besten Angebote per E-Mail' : locale === 'nl-NL' ? 'Ontvang de beste aanbiedingen per e-mail' : 'Receive the best deals by email'}
            </p>
            {subscribed ? (
              <p className="text-sm text-green-400 font-medium">✓ {t('nlSuccess')}</p>
            ) : (
              <div className="flex gap-1">
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('nlPlaceholder')}
                  className="bg-gray-800 border-gray-700 text-white text-sm h-9"
                  onKeyDown={e => { if (e.key === 'Enter' && email) { setSubscribed(true); setEmail(''); } }}
                />
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white h-9 px-3" onClick={() => { if (email) { setSubscribed(true); setEmail(''); } }}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Países */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('paises')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.filter(c => c.isActive).map(c => (
                <span key={c.id} className="text-sm text-gray-400 cursor-default" title={c.name}>{c.flag}</span>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* App Download + Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('downloadApp')}</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors">
                <Smartphone className="h-5 w-5" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none">Disponível no</p>
                  <p className="text-xs font-medium">Google Play</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors">
                <Smartphone className="h-5 w-5" />
                <div>
                  <p className="text-[10px] text-gray-400 leading-none">Download na</p>
                  <p className="text-xs font-medium">App Store</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Action. {locale === 'pt-PT' ? 'Todos os direitos reservados.' : locale === 'fr-FR' ? 'Tous droits réservés.' : locale === 'de-DE' ? 'Alle Rechte vorbehalten.' : locale === 'nl-NL' ? 'Alle rechten voorbehouden.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
              <span className="text-[10px] font-bold text-gray-400">VISA</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
              <span className="text-[10px] font-bold text-gray-400">MC</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
              <span className="text-[10px] font-bold text-gray-400">MB WAY</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
              <span className="text-[10px] font-bold text-gray-400">PAYPAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
