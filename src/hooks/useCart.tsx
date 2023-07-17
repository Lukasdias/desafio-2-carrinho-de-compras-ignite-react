import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
        children: ReactNode;
}

interface UpdateProductAmount {
        productId: number;
        amount: number;
}

interface CartContextData {
        cart: Product[];
        addProduct: (productId: number) => Promise<void>;
        removeProduct: (productId: number) => void;
        updateProductAmount: ({
                productId,
                amount,
        }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
        const [cart, setCart] = useState<Product[]>(() => {
                const persistedCart = localStorage.getItem("@RocketShoes:cart");

                if (persistedCart) {
                        return JSON.parse(persistedCart) as Product[];
                }

                return [];
        });

        const addProduct = async (productId: number) => {
                try {
                        const stockResponse = await api.get(
                                `/stock/${productId}`
                        );
                        const stock = stockResponse.data.amount as number;

                        const existingProduct = cart.find(
                                (product) => product.id === productId
                        );

                        if (existingProduct) {
                                if (stock <= existingProduct?.amount) {
                                        toast.error(
                                                "Quantidade solicitada fora de estoque"
                                        );
                                        return;
                                }
                        }

                        if (existingProduct) {
                                const updatedCart = cart.map((product) => {
                                        if (product.id === productId) {
                                                return {
                                                        ...product,
                                                        amount:
                                                                product.amount +
                                                                1,
                                                };
                                        }
                                        return product;
                                });

                                setCart(updatedCart);
                                localStorage.setItem(
                                        "@RocketShoes:cart",
                                        JSON.stringify(updatedCart)
                                );
                        } else {
                                const response = await api.get(
                                        `/products/${productId}`
                                );
                                const product = {
                                        ...response.data,
                                        amount: 1,
                                } as Product;

                                const newCart = [...cart, product];
                                setCart(newCart);
                                localStorage.setItem(
                                        "@RocketShoes:cart",
                                        JSON.stringify(newCart)
                                );
                        }
                } catch {
                        toast.error("Erro na adição do produto");
                }
        };

        const removeProduct = (productId: number) => {
                try {
                        const productExists = cart.find(
                                (product) => product.id === productId
                        );

                        if (!productExists) {
                                toast.error("Erro na remoção do produto");
                                return;
                        }

                        const newCart = cart.filter(
                                (product) => product.id !== productId
                        );

                        setCart(newCart);

                        localStorage.setItem(
                                "@RocketShoes:cart",
                                JSON.stringify(newCart)
                        );
                } catch {
                        toast.error("Erro na remoção do produto");
                }
        };

        const updateProductAmount = async ({
                productId,
                amount,
        }: UpdateProductAmount) => {
                try {
                        if (amount <= 0) {
                                return;
                        }
                        const response = await api.get(`/stock/${productId}`);
                        const stock = response.data.amount as number;
                        if (amount > stock) {
                                toast.error(
                                        "Quantidade solicitada fora de estoque"
                                );
                                return;
                        }
                        const newCart = cart.map((product) => {
                                if (product.id === productId) {
                                        return {
                                                ...product,
                                                amount,
                                        };
                                }
                                return product;
                        });
                        setCart(newCart);
                        localStorage.setItem(
                                "@RocketShoes:cart",
                                JSON.stringify(newCart)
                        );
                } catch {
                        toast.error(
                                "Erro na alteração de quantidade do produto"
                        );
                }
        };

        return (
                <CartContext.Provider
                        value={{
                                cart,
                                addProduct,
                                removeProduct,
                                updateProductAmount,
                        }}
                >
                        {children}
                </CartContext.Provider>
        );
}

export function useCart(): CartContextData {
        const context = useContext(CartContext);

        return context;
}
