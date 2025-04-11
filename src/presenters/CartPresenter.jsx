import { observer } from 'mobx-react-lite';
import CartView from '../components/requester/CartView';

import { myQuicaModel } from '../model/QuicaModel.js';

const CartPresenter = observer(() => {
  return (
    <div>
      <CartView cartItems={myQuicaModel.cart} />
    </div>
  );
});

export default CartPresenter;
