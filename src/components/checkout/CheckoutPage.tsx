'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, CreditCard, Lock, Loader2, AlertCircle, CheckCircle2, Globe, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import { DELIVERY_CONFIG, COUNTRIES } from '@/lib/constants';
import Breadcrumb from '../shared/Breadcrumb';
import type { CheckoutFormData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'form' | 'processing' | 'payment' | 'success' | 'error';
type CheckoutMode = 'express' | 'multi';

export default function CheckoutPage() {
  const navigate = useNavStore(s => s.navigate);
  const locale = useLocaleStore(s => s.country.locale);
  const country = useLocaleStore(s => s.country);
  const currency = useLocaleStore(s => s.currency);
  const formatPrice = useLocaleStore(s => s.formatPrice);
  const items = useCartStore(s => s.items);
  const getSubtotal = useCartStore(s => s.getSubtotal);
  const getShippingCost = useCartStore(s => s.getShippingCost);
  const getTotal = useCartStore(s => s.getTotal);
  const clearCart = useCartStore(s => s.clearCart);

  const [form, setForm] = useState<CheckoutFormData>({
    email: '', firstName: '', lastName: '', phone: '', address: '', city: '', postalCode: '', country: country.code,
  });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('multi');

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.firstName) newErrors.firstName = 'Obrigatório';
    if (!form.lastName) newErrors.lastName = 'Obrigatório';
    if (!form.address) newErrors.address = 'Obrigatório';
    if (!form.city) newErrors.city = 'Obrigatório';
    if (!form.postalCode) newErrors.postalCode = 'Obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (mode: CheckoutMode) => {
    if (!validate()) return;
    if (!terms) {
      setErrorMsg('Por favor, aceite os termos e condições');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('O carrinho está vazio');
      return;
    }

    setCheckoutMode(mode);
    setStep('processing');
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
          })),
          currency,
          checkoutMode: mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar o checkout');
      }

      setOrderNumber(data.orderNumber);
      setPaymentUrl(data.paymentUrl);

      if (mode === 'multi') {
        window.location.href = data.paymentUrl;
      } else {
        setStep('payment');
      }
    } catch (err) {
      console.error('[Checkout] Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar o pedido');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container max-w-6xl mx-auto px-4 pt-6">
        <Breadcrumb items={[{ label: 'Carrinho', onClick: () => navigate('cart') }, { label: 'Checkout' }]} />
        
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8"
            >
              {/* Form Section */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    Dados de Envio
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primeiro Nome</Label>
                      <Input 
                        value={form.firstName} 
                        onChange={e => updateField('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apelido</Label>
                      <Input 
                        value={form.lastName} 
                        onChange={e => updateField('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={form.email} 
                        onChange={e => updateField('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Morada</Label>
                      <Input 
                        value={form.address} 
                        onChange={e => updateField('address', e.target.value)}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input 
                        value={form.city} 
                        onChange={e => updateField('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Código Postal</Label>
                      <Input 
                        value={form.postalCode} 
                        onChange={e => updateField('postalCode', e.target.value)}
                        className={errors.postalCode ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-start space-x-2">
                    <Checkbox id="terms" checked={terms} onCheckedChange={v => setTerms(!!v)} />
                    <Label htmlFor="terms" className="text-sm text-gray-500 leading-tight cursor-pointer">
                      Li e aceito os Termos e Condições e a Política de Privacidade.
                    </Label>
                  </div>
                  
                  {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Método de Pagamento
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleCheckout('express')}
                      className="flex flex-col items-center justify-center p-6 border-2 border-primary/20 rounded-2xl hover:bg-primary/5 hover:border-primary transition-all group"
                    >
                      <CreditCard className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-gray-900">Checkout Express</span>
                      <span className="text-xs text-gray-500 text-center mt-1">Pagamento rápido com cartão (Inline)</span>
                    </button>
                    
                    <button 
                      onClick={() => handleCheckout('multi')}
                      className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all group"
                    >
                      <Globe className="h-8 w-8 text-gray-400 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-gray-900">Outros Pagamentos</span>
                      <span className="text-xs text-gray-500 text-center mt-1">MBWay, Apple Pay, Google Pay, etc.</span>
                    </button>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <ShieldCheck className="h-4 w-4" />
                    Pagamento seguro processado por NeXFlowX
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Resumo do Pedido
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.productId} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity}x {formatPrice(item.price)}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Envio</span>
                      <span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-gray-900 pt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      Checkout 100% Seguro & Encriptado
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Loader2 className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-8">A preparar o seu checkout...</h2>
              <p className="text-gray-500 mt-2">Estamos a ligar aos nossos servidores seguros.</p>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <div className="bg-primary p-6 text-white text-center">
                  <h2 className="text-xl font-bold">Checkout Express</h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">Complete o pagamento com segurança</p>
                </div>
                
                <div className="p-1 h-[500px] bg-gray-50">
                  <iframe 
                    src={paymentUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no"
                    allow="payment"
                    className="rounded-b-2xl"
                  ></iframe>
                </div>
                
                <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100">
                  <Button variant="ghost" onClick={() => setStep('form')} className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="h-3 w-3" />
                    Ligação Encriptada
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto mt-20 text-center"
            >
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Recebido!</h2>
              <p className="text-gray-500 mb-8">
                Obrigado pela sua compra. O seu pedido <span className="font-bold text-gray-900">#{orderNumber}</span> foi processado com sucesso.
              </p>
              <Button onClick={() => navigate('home')} className="w-full h-12 rounded-xl text-lg font-bold">
                Voltar à Loja
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
