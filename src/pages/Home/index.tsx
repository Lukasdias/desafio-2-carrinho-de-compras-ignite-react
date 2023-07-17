import { memo, useEffect, useState } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { ProductList } from "./styles";

interface Product {
        id: number;
        title: string;
        price: number;
        image: string;
}

export interface ProductFormatted extends Product {
        priceFormatted: string;
}

interface CartItemsAmount {
        [key: number]: number;
}

const ProductCard = memo(
        ({
                product,
                handleAddProduct,
                cartItemsAmount,
        }: {
                product: ProductFormatted;
                handleAddProduct: (id: number) => void;
                cartItemsAmount: CartItemsAmount;
        }) => {
                return (
                        <li>
                                <img src={product.image} alt={product.title} />
                                <strong>{product.title}</strong>
                                <span>{product.priceFormatted}</span>
                                <button
                                        type="button"
                                        data-testid="add-product-button"
                                        onClick={() =>
                                                handleAddProduct(product.id)
                                        }
                                >
                                        <div data-testid="cart-product-quantity">
                                                <MdAddShoppingCart
                                                        size={16}
                                                        color="#FFF"
                                                />
                                                {cartItemsAmount[product.id] ||
                                                        0}
                                        </div>

                                        <span>ADICIONAR AO CARRINHO</span>
                                </button>
                        </li>
                );
        }
);

const Home = (): JSX.Element => {
        const [products, setProducts] = useState<ProductFormatted[]>([]);
        const { addProduct, cart } = useCart();

        const cartItemsAmount = cart.reduce((sumAmount, product) => {
                const newSumAmount = { ...sumAmount };
                newSumAmount[product.id] = product.amount;

                return newSumAmount;
        }, {} as CartItemsAmount);

        useEffect(() => {
                async function loadProducts() {
                        try {
                                const response = await api.get(
                                        "http://localhost:3333/products"
                                );
                                const fetchedProducts =
                                        response.data as Product[];
                                setProducts(
                                        fetchedProducts.map((product) => {
                                                return {
                                                        ...product,
                                                        priceFormatted:
                                                                formatPrice(
                                                                        product.price
                                                                ),
                                                };
                                        })
                                );
                        } catch {
                                toast.error("Erro ao carregar produtos");
                        }
                }

                loadProducts();
        }, []);

        function handleAddProduct(id: number) {
                addProduct(id);
        }

        return (
                <ProductList>
                        {products.length === 0 && (
                                <div>
                                        <h1>
                                                Sem produtos cadastrados no
                                                momento
                                        </h1>
                                </div>
                        )}
                        {products.map((product) => {
                                return (
                                        <ProductCard
                                                key={product.id}
                                                product={product}
                                                handleAddProduct={
                                                        handleAddProduct
                                                }
                                                cartItemsAmount={
                                                        cartItemsAmount
                                                }
                                        />
                                );
                        })}
                </ProductList>
        );
};

export default Home;
