import { savePushSubscription } from '../services/apiService';
import { supabase } from '../services/supabaseClient';

// ATENÇÃO: Gere suas próprias VAPID keys e substitua esta chave pública.
// Use um gerador online ou o pacote `web-push` no Node.js.
// A chave privada deve ser mantida em segredo no seu backend.
const VAPID_PUBLIC_KEY = 'BGT_w-05l_aOPlhG1XNo4b8eY-wsk_B7vL4ZgLSA-SCG5z20Yv5e4D_F3-i4R-f_eZzZ_yY3-z_wZzZzZzZzZz'; // CHAVE DE EXEMPLO! GERE A SUA!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeUserToPush = async (): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    throw new Error('As notificações por push não são suportadas neste navegador.');
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('User is subscribed:', subscription);
    
    // Get current user from Supabase auth session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Usuário não autenticado. Não é possível salvar a inscrição para notificações.");
    }
    
    await savePushSubscription(subscription, user.id);
    
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    if (Notification.permission === 'denied') {
      throw new Error('A permissão para notificações foi negada. Por favor, habilite-a nas configurações do seu navegador.');
    }
    throw new Error('Não foi possível ativar as notificações.');
  }
};