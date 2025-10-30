export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl?: string;
  category?: string;
  available?: boolean | string;
}
