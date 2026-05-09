export interface Product {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  category: string;
  rating: number;
}

export interface Category {
  slug: string;
  name: string;
}
