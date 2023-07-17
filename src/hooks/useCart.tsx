import {
        createContext,
        ReactNode,
        useContext,
        useEffect,
        useState,
} from "react";
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
                const storagedCart = localStorage.getItem("@RocketShoes:cart");

                if (storagedCart) {
                        return JSON.parse(storagedCart) as Product[];
                }

                return [];
        });

        useEffect(() => {
                localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
        }, [cart]);

        const addProduct = async (productId: number) => {
                try {
                        if (cart.find((product) => product.id === productId)) {
                                updateProductAmount({
                                        productId,
                                        amount:
                                                (cart.find(
                                                        (product) =>
                                                                product.id ===
                                                                productId
                                                )?.amount as number) + 1,
                                });
                                return;
                        }
                        const response = await api.get(
                                `/products/${productId}`
                        );
                        const product = {
                                ...response.data,
                                amount: 1,
                        } as Product;
                        setCart([...cart, product]);
                } catch {
                        toast.error("Erro na adição do produto");
                }
        };

        const removeProduct = (productId: number) => {
                try {
                        if (!cart.find((product) => product.id === productId)) {
                                toast.error("O produto não existe no carrinho");
                                return;
                        }
                        setCart(
                                cart.filter(
                                        (product) => product.id !== productId
                                )
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
                        if (!cart.find((product) => product.id === productId)) {
                                toast.error("O produto não existe no carrinho");
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
                        setCart(
                                cart.map((product) => {
                                        if (product.id === productId) {
                                                return {
                                                        ...product,
                                                        amount,
                                                };
                                        }
                                        return product;
                                })
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
