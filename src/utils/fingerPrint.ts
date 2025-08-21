import { createHash } from 'crypto';

export function cartFingerprint(items: Array<{productId: string; price: number; quantity: number}>) {
  const norm = items
    .map(i => ({ productId: String(i.productId), price: Number(i.price), quantity: Number(i.quantity) }))
    .sort((a,b) => a.productId.localeCompare(b.productId));
  return createHash('sha1').update(JSON.stringify(norm)).digest('hex');
}
