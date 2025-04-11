import { observer } from 'mobx-react-lite';
import CartView from '../components/requester/CartView';

// TODO: Import model once Bhavya provides it
// import { myQuicaModel } from '../model/QuicaModel';

const CartPresenter = observer(() => {
  // TODO: Replace with actual model state
  // const cartItems = myQuicaModel.cart;
  const mockCartItems = [
    { id: '1', name: 'Milk', price: 3.99 },
    { id: '2', name: 'Bread', price: 2.49 },
  ];

  return (
    <div>
      <CartView cartItems={mockCartItems} />
    </div>
  );
});

export default CartPresenter;
