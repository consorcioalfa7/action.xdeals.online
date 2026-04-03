'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, CreditCard, Lock, Loader2, AlertCircle, CheckCircle2, ExternalLink, Globe } from 'lucide-react';
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

type Step = 'form' | 'processing' | 'payment' | 'success' | 'error';

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

  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  // ── Cleanup popup listener on unmount ─────────────────────
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  // ── Listen for popup close to detect payment result ───────
  const checkPopupClosed = useCallback(() => {
    if (popupRef.current?.closed) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      // User closed popup — go back to form to retry
      setStep('form');
      setErrorMsg('A janela de pagamento foi fechada. Tente novamente.');
    }
  }, []);

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
    if (!form.country) newErrors.country = 'Selecione um país';
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

      // ── Has payment URL → open in popup ────────────────────
      if (data.paymentUrl) {
        setOrderNumber(data.orderNumber);
        setPaymentUrl(data.paymentUrl);
        setStep('payment');

        // Open NeXFlowX hosted checkout in a popup window
        const popupWidth = Math.min(500, window.innerWidth - 40);
        const popupHeight = Math.min(700, window.innerHeight - 40);
        const left = (window.innerWidth - popupWidth) / 2;
        const top = (window.innerHeight - popupHeight) / 2;

        popupRef.current = window.open(
          data.paymentUrl,
          'nexflowx-payment',
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        // If popup was blocked by browser, fallback to new tab
        if (!popupRef.current || popupRef.current.closed) {
          popupRef.current = window.open(data.paymentUrl, '_blank');
        }

        // Poll popup closed status
        if (popupRef.current) {
          checkIntervalRef.current = setInterval(checkPopupClosed, 1000);
        }
      } else if (data.warning) {
        setErrorMsg(data.warning);
        setStep('error');
      } else {
        // No payment link (fallback)
        setOrderNumber(data.orderNumber);
        clearCart();
        setStep('success');
      }
    } catch (err) {
      console.error('[Checkout] Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar o pedido');
      setStep('error');
    }
  };

  const handlePopupClosedManually = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    setStep('form');
    setErrorMsg('Pagamento cancelado. Tente novamente.');
  };

  const handlePaymentSuccess = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    clearCart();
    setStep('success');
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
    countryLbl: { "pt-PT": "País de Entrega", "fr-FR": "Pays de livraison", "es-ES": "País de envío", "de-DE": "Lieferland", "nl-NL": "Bezorgland", "pt-BR": "País de Entrega" },
    selectCountry: { "pt-PT": "Selecione o país", "fr-FR": "Sélectionnez le pays", "es-ES": "Seleccione el país", "de-DE": "Land auswählen", "nl-NL": "Selecteer land", "pt-BR": "Selecione o país" },
    subtotal: { "pt-PT": "Subtotal", "fr-FR": "Sous-total", "es-ES": "Subtotal", "de-DE": "Zwischensumme", "nl-NL": "Subtotaal", "pt-BR": "Subtotal" },
    shipping: { "pt-PT": "Envio", "fr-FR": "Livraison", "es-ES": "Envío", "de-DE": "Versand", "nl-NL": "Bezorging", "pt-BR": "Frete" },
    free: { "pt-PT": "Grátis", "fr-FR": "Gratuit", "es-ES": "Gratis", "de-DE": "Kostenlos", "nl-NL": "Gratis", "pt-BR": "Grátis" },
    total: { "pt-PT": "Total", "fr-FR": "Total", "es-ES": "Total", "de-DE": "Gesamt", "nl-NL": "Totaal", "pt-BR": "Total" },
    pay: { "pt-PT": "Finalizar Compra", "fr-FR": "Finaliser l'achat", "es-ES": "Finalizar compra", "de-DE": "Jetzt bezahlen", "nl-NL": "Nu betalen", "pt-BR": "Finalizar Compra" },
    secure: { "pt-PT": "Pagamento seguro processado por NeXFlowX", "fr-FR": "Paiement sécurisé via NeXFlowX", "es-ES": "Pago seguro via NeXFlowX", "de-DE": "Sichere Zahlung via NeXFlowX", "nl-NL": "Veilige betaling via NeXFlowX", "pt-BR": "Pagamento seguro via NeXFlowX" },
    terms: { "pt-PT": "Li e aceito os Termos e Condições", "fr-FR": "J'ai lu et j'accepte les CGV", "es-ES": "He leído y acepto los Términos", "de-DE": "AGB gelesen und akzeptiert", "nl-NL": "Voorwaarden gelezen en akkoord", "pt-BR": "Li e aceito os Termos e Condições" },
    processing: { "pt-PT": "A criar o seu pedido...", "fr-FR": "Création de votre commande...", "es-ES": "Creando su pedido...", "de-DE": "Bestellung wird erstellt...", "nl-NL": "Bestelling wordt gemaakt...", "pt-BR": "Criando seu pedido..." },
    paymentTitle: { "pt-PT": "Pagamento em curso", "fr-FR": "Paiement en cours", "es-ES": "Pago en curso", "de-DE": "Zahlung läuft", "nl-NL": "Betaling bezig", "pt-BR": "Pagamento em andamento" },
    paymentDesc: { "pt-PT": "Complete o pagamento na janela aberta. Não feche esta página.", "fr-FR": "Complétez le paiement dans la fenêtre ouverte.", "es-ES": "Complete el pago en la ventana abierta.", "de-DE": "Schließen Sie die Zahlung im geöffneten Fenster ab.", "nl-NL": "Voltooi de betaling in het geopende venster.", "pt-BR": "Complete o pagamento na janela aberta." },
    cancelPayment: { "pt-PT": "Cancelar Pagamento", "fr-FR": "Annuler le paiement", "es-ES": "Cancelar pago", "de-DE": "Zahlung abbrechen", "nl-NL": "Betaling annuleren", "pt-BR": "Cancelar Pagamento" },
    confirmPayment: { "pt-PT": "Já paguei", "fr-FR": "J'ai payé", "es-ES": "Ya pagué", "de-DE": "Ich habe bezahlt", "nl-NL": "Ik heb betaald", "pt-BR": "Já paguei" },
    openAgain: { "pt-PT": "Abrir janela de pagamento novamente", "fr-FR": "Rouvrir la fenêtre de paiement", "es-ES": "Abrir ventana de pago otra vez", "de-DE": "Zahlungsfenster erneut öffnen", "nl-NL": "Betaalvenster opnieuw openen", "pt-BR": "Abrir janela de pagamento novamente" },
    successTitle: { "pt-PT": "Pedido Confirmado!", "fr-FR": "Commande Confirmée!", "es-ES": "¡Pedido Confirmado!", "de-DE": "Bestellung Bestätigt!", "nl-NL": "Bestelling Bevestigd!", "pt-BR": "Pedido Confirmado!" },
    successDesc: { "pt-PT": "O seu pedido foi processado com sucesso. Receberá um email de confirmação em breve.", "fr-FR": "Votre commande a été traitée avec succès.", "es-ES": "¡Su pedido ha sido procesado con éxito!", "de-DE": "Ihre Bestellung wurde erfolgreich verarbeitet.", "nl-NL": "Uw bestelling is succesvol verwerkt.", "pt-BR": "Seu pedido foi processado com sucesso!" },
    continueShopping: { "pt-PT": "Continuar as Compras", "fr-FR": "Continuer les achats", "es-ES": "Seguir Comprando", "de-DE": "Weiter einkaufen", "nl-NL": "Verder winkelen", "pt-BR": "Continuar as Compras" },
    back: { "pt-PT": "Voltar", "fr-FR": "Retour", "es-ES": "Volver", "de-DE": "Zurück", "nl-NL": "Terug", "pt-BR": "Voltar" },
    retry: { "pt-PT": "Tentar novamente", "fr-FR": "Réessayer", "es-ES": "Reintentar", "de-DE": "Erneut versuchen", "nl-NL": "Opnieuw proberen", "pt-BR": "Tentar novamente" },
    orderCreated: { "pt-PT": "Pedido criado com sucesso!", "fr-FR": "Commande créée!", "es-ES": "¡Pedido creado!", "de-DE": "Bestellung erstellt!", "nl-NL": "Bestelling geplaatst!", "pt-BR": "Pedido criado!" },
    dontClose: { "pt-PT": "Não feche esta página enquanto a janela de pagamento estiver aberta.", "fr-FR": "Ne fermez pas cette page pendant le paiement.", "es-ES": "No cierre esta página mientras la ventana de pago esté abierta.", "de-DE": "Schließen Sie diese Seite nicht während der Zahlung.", "nl-NL": "Sluit deze pagina niet tijdens de betaling.", "pt-BR": "Não feche esta página enquanto a janela de pagamento estiver aberta." },
  };

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['pt-PT'] || key;

  // ── Render: Processing state ───────────────────────────────
  if (step === 'processing') {
    return (
      <div className="page-transition">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-bold">{t('processing')}</h2>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Payment popup state ────────────────────────────
  if (step === 'payment') {
    return (
      <div className="page-transition">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              {/* Animated payment icon */}
              <div className="h-20 w-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center animate-pulse">
                <CreditCard className="h-10 w-10 text-primary" />
              </div>

              <h2 className="text-xl font-bold">{t('paymentTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('dontClose')}</p>

              {orderNumber && (
                <div className="bg-gray-50 rounded-lg px-4 py-2 w-full">
                  <p className="text-xs text-muted-foreground">Pedido</p>
                  <p className="text-sm font-mono font-bold">{orderNumber}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatPrice(total)} {currency}
                  </p>
                </div>
              )}

              {/* Countdown / Status message */}
              <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  ⏳ {t('paymentDesc')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 w-full mt-4">
                <Button
                  onClick={() => {
                    // Re-open popup if closed
                    if (!popupRef.current || popupRef.current.closed) {
                      const pw = Math.min(500, window.innerWidth - 40);
                      const ph = Math.min(700, window.innerHeight - 40);
                      const l = (window.innerWidth - pw) / 2;
                      const t2 = (window.innerHeight - ph) / 2;
                      popupRef.current = window.open(
                        paymentUrl,
                        'nexflowx-payment',
                        `width=${pw},height=${ph},left=${l},top=${t2},scrollbars=yes,resizable=yes`
                      );
                      if (popupRef.current) {
                        checkIntervalRef.current = setInterval(checkPopupClosed, 1000);
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('openAgain')}
                </Button>

                <Button
                  onClick={handlePaymentSuccess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('confirmPayment')}
                </Button>

                <Button
                  onClick={handlePopupClosedManually}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  {t('cancelPayment')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Success state ──────────────────────────────────
  if (step === 'success') {
    return (
      <div className="page-transition">
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700">{t('successTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('successDesc')}</p>
            {orderNumber && (
              <p className="text-sm font-mono bg-gray-50 px-4 py-2 rounded-lg">
                Pedido: {orderNumber}
              </p>
            )}
            <Button onClick={() => navigate('home')} className="mt-4">
              {t('continueShopping')}
            </Button>
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
                {/* Email */}
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

                {/* First Name */}
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

                {/* Last Name */}
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

                {/* Phone */}
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

                {/* Address */}
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

                {/* City */}
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

                {/* Postal Code */}
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

                {/* Country - EDITABLE dropdown */}
                <div className="sm:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {t('countryLbl')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.country}
                    onValueChange={(val) => updateField('country', val)}
                  >
                    <SelectTrigger className={`mt-1 ${errors.country ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={t('selectCountry')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.filter(c => c.isActive).map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
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
