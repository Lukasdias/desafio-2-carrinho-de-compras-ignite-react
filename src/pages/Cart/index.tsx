import {
        MdAddCircleOutline,
        MdDelete,
        MdRemoveCircleOutline,
} from "react-icons/md";

// import { useCart } from '../../hooks/useCart';
// import { formatPrice } from '../../util/format';
import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
        id: number;
        title: string;
        price: number;
        image: string;
        amount: number;
}

interface ProductOnCartCardProps {
        product: Product;
        handleProductIncrement: (product: Product) => void;
        handleProductDecrement: (product: Product) => void;
        handleRemoveProduct: (productId: number) => void;
}

const ProductOnCartCard = (props: ProductOnCartCardProps) => {
        return (
                <ProductTable>
                        <thead>
                                <tr>
                                        <th aria-label="product image" />
                                        <th>PRODUTO</th>
                                        <th>QTD</th>
                                        <th>SUBTOTAL</th>
                                        <th aria-label="delete icon" />
                                </tr>
                        </thead>
                        <tbody>
                                <tr data-testid="product">
                                        <td>
                                                <img
                                                        src={
                                                                props.product
                                                                        .image
                                                        }
                                                        alt={
                                                                props.product
                                                                        .title
                                                        }
                                                />
                                        </td>
                                        <td>
                                                <strong>
                                                        {props.product.title}
                                                </strong>
                                                <span>
                                                        {formatPrice(
                                                                props.product
                                                                        .price
                                                        )}
                                                </span>
                                        </td>
                                        <td>
                                                <div>
                                                        <button
                                                                type="button"
                                                                data-testid="decrement-product"
                                                                disabled={
                                                                        props
                                                                                .product
                                                                                .amount <=
                                                                        1
                                                                }
                                                                onClick={() =>
                                                                        props.handleProductDecrement(
                                                                                props.product
                                                                        )
                                                                }
                                                        >
                                                                <MdRemoveCircleOutline
                                                                        size={
                                                                                20
                                                                        }
                                                                />
                                                        </button>
                                                        <input
                                                                type="text"
                                                                data-testid="product-amount"
                                                                readOnly
                                                                value={
                                                                        props
                                                                                .product
                                                                                .amount
                                                                }
                                                        />
                                                        <button
                                                                type="button"
                                                                data-testid="increment-product"
                                                                onClick={() =>
                                                                        props.handleProductIncrement(
                                                                                props.product
                                                                        )
                                                                }
                                                        >
                                                                <MdAddCircleOutline
                                                                        size={
                                                                                20
                                                                        }
                                                                />
                                                        </button>
                                                </div>
                                        </td>
                                        <td>
                                                <strong>
                                                        {formatPrice(
                                                                props.product
                                                                        .price *
                                                                        props
                                                                                .product
                                                                                .amount
                                                        )}
                                                </strong>
                                        </td>
                                        <td>
                                                <button
                                                        type="button"
                                                        data-testid="remove-product"
                                                        onClick={() =>
                                                                props.handleRemoveProduct(
                                                                        props
                                                                                .product
                                                                                .id
                                                                )
                                                        }
                                                >
                                                        <MdDelete size={20} />
                                                </button>
                                        </td>
                                </tr>
                        </tbody>
                </ProductTable>
        );
};

const Cart = (): JSX.Element => {
        const { cart, removeProduct, updateProductAmount } = useCart();

        const total = formatPrice(
                cart.reduce((sumTotal, product) => {
                        sumTotal += product.price * product.amount;
                        return sumTotal;
                }, 0)
        );

        function handleProductIncrement(product: Product) {
                if (product.amount === 0) {
                        toast.error(
                                "Não é possível adicionar uma quantidade menor que 1"
                        );
                        return;
                }
                updateProductAmount({
                        productId: product.id,
                        amount: product.amount + 1,
                });
        }

        function handleProductDecrement(product: Product) {
                if (product.amount === 0) {
                        toast.error(
                                "Não é possível reduzir uma quantidade menor que 1"
                        );
                        return;
                }
                updateProductAmount({
                        productId: product.id,
                        amount: product.amount - 1,
                });
        }

        function handleRemoveProduct(productId: number) {
                if (!cart.find((product) => product.id === productId)) {
                        toast.error(
                                "Erro na remoção do produto, o produto não existe no carrinho"
                        );
                        return;
                }
                removeProduct(productId);
        }

        function submitOrder() {
                if (cart.length === 0) {
                        toast.error("Não é possível enviar um pedido vazio");
                        return;
                }
                toast.success("Pedido enviado com sucesso!");
        }

        return (
                <Container>
                        {cart.length === 0 ? (
                                <> Carrinho Vazio </>
                        ) : (
                                <>
                                        {cart?.map((product) => (
                                                <ProductOnCartCard
                                                        key={product.id}
                                                        product={product}
                                                        handleProductIncrement={
                                                                handleProductIncrement
                                                        }
                                                        handleProductDecrement={
                                                                handleProductDecrement
                                                        }
                                                        handleRemoveProduct={
                                                                handleRemoveProduct
                                                        }
                                                />
                                        ))}
                                </>
                        )}

                        <footer>
                                <button type="button" onClick={submitOrder}>
                                        Finalizar pedido
                                </button>

                                <Total>
                                        <span>TOTAL</span>
                                        <strong>{total}</strong>
                                </Total>
                        </footer>
                </Container>
        );
};

export default Cart;
