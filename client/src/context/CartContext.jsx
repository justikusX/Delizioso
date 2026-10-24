import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MAX_QUANTITY } from '../data';
import { readJson, writeJson } from '../utils/storage';

const CART_KEY = 'delizioso-cart';
const VOUCHER_KEY = 'delizioso-voucher';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => readJson(CART_KEY, {}));
    const [voucher, setVoucherState] = useState(() => readJson(VOUCHER_KEY));

    useEffect(() => {
        const sync = (e) => {
            if (e.key === CART_KEY) setItems(readJson(CART_KEY, {}));
            if (e.key === VOUCHER_KEY) setVoucherState(readJson(VOUCHER_KEY));
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);

    const save = useCallback((next) => {
        writeJson(CART_KEY, next);
        setItems(next);
    }, []);

    const setQuantity = useCallback(
        (id, quantity) => {
            const next = { ...readJson(CART_KEY, {}) };
            const value = Math.min(MAX_QUANTITY, Math.max(0, quantity));
            if (value === 0) delete next[id];
            else next[id] = value;
            save(next);
        },
        [save],
    );

    const add = useCallback((id) => setQuantity(id, (readJson(CART_KEY, {})[id] || 0) + 1), [setQuantity]);

    const setVoucher = useCallback((value) => {
        writeJson(VOUCHER_KEY, value);
        setVoucherState(value);
    }, []);

    const clear = useCallback(() => {
        save({});
        setVoucher(null);
    }, [save, setVoucher]);

    const count = Object.values(items).reduce((sum, q) => sum + q, 0);

    return (
        <CartContext.Provider value={{ items, count, add, setQuantity, clear, voucher, setVoucher }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
