'use client';

import { useLocaleStore, useNavStore } from '@/lib/store';
import { Facebook, Instagram, Youtube, Twitter, ShieldCheck, CreditCard, Truck, RefreshCcw, Heart } from 'lucide-react';

export default function Footer() {
  const locale = useLocaleStore(s => s.country.locale);
  const navigate = useNavStore(s => s.navigate);

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 mt-auto">
      <div className="container mx-auto px-4">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-1">Entrega Rápida</h4>
              <p className="text-sm text-gray-400">Receba em sua casa em até 7 dias úteis.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-1">Pagamento Seguro</h4>
              <p className="text-sm text-gray-400">Processado pela NeXFlowX com encriptação total.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shrink-0">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-1">Devolução Fácil</h4>
              <p className="text-sm text-gray-400">14 dias para devolver se não estiver satisfeito.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shrink-0">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-lg mb-1">Apoio ao Cliente</h4>
              <p className="text-sm text-gray-400">Estamos aqui para ajudar em todas as etapas.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-t border-white/5 pt-20">
          <div className="space-y-6">
            <span className="text-3xl font-black tracking-tighter text-white">
              ACTION<span className="text-primary">.</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A sua loja favorita de preços baixos, agora online com a melhor experiência de compra e pagamentos seguros.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-primary">Links Úteis</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">Página Inicial</button></li>
              <li><button onClick={() => navigate('weekly')} className="hover:text-white transition-colors">Ofertas da Semana</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lojas Físicas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-primary">Ajuda</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos e Condições</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Livro de Reclamações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-primary">Pagamento Seguro</h4>
            <div className="space-y-6">
              <p className="text-sm text-gray-400">Aceitamos todos os principais métodos de pagamento através da plataforma NeXFlowX.</p>
              <div className="flex flex-wrap gap-3">
                <div className="h-8 w-12 bg-white/10 rounded-md flex items-center justify-center border border-white/10">
                  <CreditCard className="h-4 w-4 text-white/60" />
                </div>
                <div className="px-3 h-8 bg-white/10 rounded-md flex items-center justify-center border border-white/10 text-[10px] font-bold">MBWAY</div>
                <div className="px-3 h-8 bg-white/10 rounded-md flex items-center justify-center border border-white/10 text-[10px] font-bold">APPLE PAY</div>
                <div className="px-3 h-8 bg-white/10 rounded-md flex items-center justify-center border border-white/10 text-[10px] font-bold">VISA</div>
                <div className="px-3 h-8 bg-white/10 rounded-md flex items-center justify-center border border-white/10 text-[10px] font-bold">MASTERCARD</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Action. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Pagamentos orquestrados por <strong>NeXFlowX</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
