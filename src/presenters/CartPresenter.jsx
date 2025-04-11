import { observer } from 'mobx-react-lite';
import CartView from '../components/requester/CartView';

import { myQuicaModel } from '../model/QuicaModel.js';

const CartPresenter = observer(() => {
  const isLoading = myQuicaModel.isLoading;

  return (
    <div>
      <CartView 
        items={myQuicaModel.cart}
        onRemoveFromCart={(item) => {
          myQuicaModel.removeFromCart(item);
        }}
        onPlaceOrder={() => {
          myQuicaModel.placeOrder();
        }}
        isLoading={isLoading}
      />
    </div>
  );
});

export default CartPresenter;
