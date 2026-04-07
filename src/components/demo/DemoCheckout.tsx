'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, ShieldCheck, Zap, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoCheckout() {
  const [mode, setMode] = useState<'express' | 'multi' | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const startCheckout = async (selectedMode: 'express' | 'multi') => {
    setLoading(true);
    setMode(selectedMode);
    setCheckoutUrl(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          items: [
            { id: 'demo-1', name: 'Produto de Demonstração', price: 29.99, quantity: 1 }
          ],
          customer: {
            email: 'demo@nexflowx.tech',
            name: 'Utilizador Demo'
          }
        })
      });

      const data = await response.json();
      if (data.url) {
        setCheckoutUrl(data.url);
        setOrderId(data.orderId);
        
        if (selectedMode === 'multi') {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('Erro no checkout demo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="text-center mb-12 space-y-4">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          Ambiente de Testes
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          NeXFlowX Payment Demo
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Experimente a integração do Checkout Dual. Escolha um modo para ver como a tecnologia da NeXFlowX transforma a experiência de pagamento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Express Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${mode === 'express' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          onClick={() => startCheckout('express')}
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Zap className="h-8 w-8 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Checkout Express</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Pagamento instantâneo via Iframe. O utilizador nunca sai do seu site, aumentando a taxa de conversão em até 35%.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Inline Iframe Experience
            </li>
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Cartão de Crédito Rápido
            </li>
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Fricção Zero
            </li>
          </ul>
          <Button 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black"
          >
            {loading && mode === 'express' ? 'A processar...' : 'Testar Express'}
          </Button>
        </motion.div>

        {/* Multi Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${mode === 'multi' ? 'border-blue-600 bg-blue-50/50 shadow-2xl shadow-blue-600/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          onClick={() => startCheckout('multi')}
        >
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Multi-Métodos</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Acesso total a MBWay, Apple Pay, Google Pay e referências multibanco através de redirecionamento seguro.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-blue-500" /> MBWay & Apple Pay
            </li>
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-blue-500" /> Redirecionamento Seguro
            </li>
            <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-blue-500" /> Suporte Multi-Moeda
            </li>
          </ul>
          <Button 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-black"
          >
            {loading && mode === 'multi' ? 'A redirecionar...' : 'Testar Multi-Métodos'}
          </Button>
        </motion.div>
      </div>

      {/* Express Iframe Container */}
      <AnimatePresence>
        {mode === 'express' && checkoutUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-900">Modo Express Ativo: Iframe Renderizado</span>
              </div>
              <button onClick={() => { setMode(null); setCheckoutUrl(null); }} className="text-xs font-black text-amber-900 underline">Fechar</button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border-4 border-gray-100 shadow-2xl overflow-hidden min-h-[500px] relative">
              <iframe 
                src={checkoutUrl} 
                className="w-full h-[600px] border-none"
                title="NeXFlowX Express Checkout"
                allow="payment"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-20 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-black uppercase tracking-widest text-xs">Segurança Garantida</span>
          </div>
          <h4 className="text-xl font-black text-gray-900">Pronto para integrar no seu negócio?</h4>
          <p className="text-sm text-gray-500">A NeXFlowX oferece a documentação mais simples do mercado.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black gap-2 shadow-xl shadow-primary/20">
          Ver Documentação <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
