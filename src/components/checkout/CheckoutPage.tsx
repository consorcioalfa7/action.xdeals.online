'use client';

import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useLocaleStore, useNavStore } from '@/lib/store';
import { DELIVERY_CONFIG } from '@/lib/constants';
import Breadcrumb from '../shared/Breadcrumb';
import type { CheckoutFormData } from '@/lib/types';

type Step = 'form' | 'processing' | 'redirecting' | 'error';

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

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  // Redirect back from payment? Show success
  const isBackFromPayment = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('payment') === 'success';

  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.firstName) newErrors.firstName = 'Campo obrigatório';
    if (!form.lastName) newErrors.lastName = 'Campo obrigatório';
    if (!form.address) newErrors.address = 'Campo obrigatório';
    if (!form.city) newErrors.city = 'Campo obrigatório';
    if (!form.postalCode) newErrors.postalCode = 'Campo obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!terms) {
      setErrorMsg('Deve aceitar os Termos e Condições');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('O carrinho está vazio');
      return;
    }

    setStep('processing');
    setErrorMsg('');

    try {
      // ── Call backend checkout ──────────────────────────────
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
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            stockCount: item.stockCount,
          })),
          currency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${res.status}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar pedido');
      }

      // ── Backend devolve: { paymentUrl, orderNumber, total } ──
      if (data.paymentUrl) {
        // ── Tem link de pagamento → redirecionar ────────────
        setOrderNumber(data.orderNumber);
        setPaymentUrl(data.paymentUrl);
        setStep('redirecting');

        // Redireciona para o shareable_url da NeXFlowX
        window.location.href = data.paymentUrl;
      } else if (data.warning) {
        // API de pagamentos indisponível
        setErrorMsg(data.warning);
        setStep('error');
      } else {
        // Pedido criado sem pagamento (fallback)
        setOrderNumber(data.orderNumber);
        clearCart();
        setStep('redirecting');
        setTimeout(() => navigate('home'), 2000);
      }
    } catch (err) {
      console.error('[Checkout] Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar o pedido');
      setStep('error');
    }
  };

  // ── Labels (multilíngue) ────────────────────────────────────
  const labels: Record<string, Record<string, string>> = {
    title: { "pt-PT": "Finalizar Compra", "fr-FR": "Finaliser l'achat", "es-ES": "Finalizar compra", "de-DE": "Kasse", "nl-NL": "Afrekenen", "pt-BR": "Finalizar Compra" },
    shippingInfo: { "pt-PT": "Dados de Envio", "fr-FR": "Informations de livraison", "es-ES": "Datos de envío", "de-DE": "Versandinformationen", "nl-NL": "Bezorggegevens", "pt-BR": "Dados de Envio" },
    orderSummary: { "pt-PT": "Resumo do Pedido", "fr-FR": "Résumé de commande", "es-ES": "Resumen del pedido", "de-DE": "Bestellübersicht", "nl-NL": "Bestellingsoverzicht", "pt-BR": "Resumo do Pedido" },
    email: { "pt-PT": "Email", "fr-FR": "Email", "es-ES": "Email", "de-DE": "E-Mail", "nl-NL": "E-mail", "pt-BR": "Email" },
    firstName: { "pt-PT": "Primeiro Nome", "fr-FR": "Prénom", "es-ES": "Nombre", "de-DE": "Vorname", "nl-NL": "Voornaam", "pt-BR": "Primeiro Nome" },
    lastName: { "pt-PT": "Apelido", "fr-FR": "Nom", "es-ES": "Apellido", "de-DE": "Nachname", "nl-NL": "Achternaam", "pt-BR": "Sobrenome" },
    phone: { "pt-PT": "Telefone", "fr-FR": "Téléphone", "es-ES": "Teléfono", "de-DE": "Telefon", "nl-NL": "Telefoon", "pt-BR": "Telefone" },
    address: { "pt-PT": "Morada", "fr-FR": "Adresse", "es-ES": "Dirección", "de-DE": "Adresse", "nl-NL": "Adres", "pt-BR": "Endereço" },
    city: { "pt-PT": "Cidade", "fr-FR": "Ville", "es-ES": "Ciudad", "de-DE": "Stadt", "nl-NL": "Stad", "pt-BR": "Cidade" },
    postalCode: { "pt-PT": "Código Postal", "fr-FR": "Code postal", "es-ES": "Código postal", "de-DE": "PLZ", "nl-NL": "Postcode", "pt-BR": "CEP" },
    countryLbl: { "pt-PT": "País", "fr-FR": "Pays", "es-ES": "País", "de-DE": "Land", "nl-NL": "Land", "pt-BR": "País" },
    subtotal: { "pt-PT": "Subtotal", "fr-FR": "Sous-total", "es-ES": "Subtotal", "de-DE": "Zwischensumme", "nl-NL": "Subtotaal", "pt-BR": "Subtotal" },
    shipping: { "pt-PT": "Envio", "fr-FR": "Livraison", "es-ES": "Envío", "de-DE": "Versand", "nl-NL": "Bezorging", "pt-BR": "Frete" },
    free: { "pt-PT": "Grátis", "fr-FR": "Gratuit", "es-ES": "Gratis", "de-DE": "Kostenlos", "nl-NL": "Gratis", "pt-BR": "Grátis" },
    total: { "pt-PT": "Total", "fr-FR": "Total", "es-ES": "Total", "de-DE": "Gesamt", "nl-NL": "Totaal", "pt-BR": "Total" },
    pay: { "pt-PT": "Finalizar Compra", "fr-FR": "Finaliser l'achat", "es-ES": "Finalizar compra", "de-DE": "Jetzt bezahlen", "nl-NL": "Nu betalen", "pt-BR": "Finalizar Compra" },
    secure: { "pt-PT": "Pagamento seguro processado por NeXFlowX", "fr-FR": "Paiement sécurisé via NeXFlowX", "es-ES": "Pago seguro via NeXFlowX", "de-DE": "Sichere Zahlung via NeXFlowX", "nl-NL": "Veilige betaling via NeXFlowX", "pt-BR": "Pagamento seguro via NeXFlowX" },
    terms: { "pt-PT": "Li e aceito os Termos e Condições", "fr-FR": "J'ai lu et j'accepte les CGV", "es-ES": "He leído y acepto los Términos", "de-DE": "AGB gelesen und akzeptiert", "nl-NL": "Voorwaarden gelezen en akkoord", "pt-BR": "Li e aceito os Termos e Condições" },
    processing: { "pt-PT": "A criar o seu pedido...", "fr-FR": "Création de votre commande...", "es-ES": "Creando su pedido...", "de-DE": "Bestellung wird erstellt...", "nl-NL": "Bestelling wordt gemaakt...", "pt-BR": "Criando seu pedido..." },
    redirecting: { "pt-PT": "A redirecionar para o pagamento seguro...", "fr-FR": "Redirection vers le paiement sécurisé...", "es-ES": "Redirigiendo al pago seguro...", "de-DE": "Weiterleitung zur sicheren Zahlung...", "nl-NL": "Doorsturen naar veilige betaling...", "pt-BR": "Redirecionando para o pagamento..." },
    back: { "pt-PT": "Voltar", "fr-FR": "Retour", "es-ES": "Volver", "de-DE": "Zurück", "nl-NL": "Terug", "pt-BR": "Voltar" },
    retry: { "pt-PT": "Tentar novamente", "fr-FR": "Réessayer", "es-ES": "Reintentar", "de-DE": "Erneut versuchen", "nl-NL": "Opnieuw proberen", "pt-BR": "Tentar novamente" },
    orderCreated: { "pt-PT": "Pedido criado com sucesso!", "fr-FR": "Commande créée!", "es-ES": "¡Pedido creado!", "de-DE": "Bestellung erstellt!", "nl-NL": "Bestelling geplaatst!", "pt-BR": "Pedido criado!" },
  };

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['pt-PT'] || key;

  // ── Render: Processing / Redirecting state ─────────────────
  if (step === 'processing' || step === 'redirecting') {
    return (
      <div className="page-transition">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-bold">{step === 'processing' ? t('processing') : t('redirecting')}</h2>
            <p className="text-sm text-muted-foreground">
              {orderNumber && `Pedido: ${orderNumber}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Não feche esta janela. Será redirecionado para o pagamento seguro.
            </p>
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_self"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Clique aqui se não for redirecionado automaticamente
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Error state ────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="page-transition">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold">Erro ao processar</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => { setStep('form'); setErrorMsg(''); }}>
                {t('retry')}
              </Button>
              <Button variant="outline" onClick={() => navigate('home')}>
                {t('back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Main checkout form ────────────────────────────
  return (
    <div className="page-transition">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumb />

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Shipping Form ─────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">{t('shippingInfo')}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="email">{t('email')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    placeholder="nome@email.com"
                    className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="firstName">{t('firstName')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">{t('lastName')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    className={`mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="+351 912 345 678"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address">{t('address')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={e => updateField('address', e.target.value)}
                    placeholder="Rua, número, andar"
                    className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="city">{t('city')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                    className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="postalCode">{t('postalCode')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={e => updateField('postalCode', e.target.value)}
                    className={`mt-1 ${errors.postalCode ? 'border-red-500' : ''}`}
                  />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                </div>

                <div>
                  <Label>{t('countryLbl')}</Label>
                  <Input
                    value={`${country.flag} ${country.name}`}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="mt-6">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(v) => setTerms(!!v)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer mt-0.5">
                    {t('terms')}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">{t('orderSummary')}</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-300">{item.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? t('free') : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Entrega grátis!
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currency === 'EUR' ? 'IVA incluído' : 'Moeda: BRL (R$)'}
                </p>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handleSubmit}
                disabled={items.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold rounded-lg mt-6"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {t('pay')} • {formatPrice(total)}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                {t('secure')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
