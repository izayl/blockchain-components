import {initialState, validatePendingWallet, walletSlice} from './walletSlice';

import {DEFAULT_SERIALIZED_CONNECTOR} from '~/test/fixtures/connector';
import {
  INVALID_SIGNATURE_RESPONSE,
  VALID_SIGNATURE_RESPONSE,
} from '~/test/fixtures/signature';
import {ALTERNATE_WALLET, DEFAULT_WALLET} from '~/test/fixtures/wallet';
import {ConnectWalletError} from '~/utils/error';

const {
  addWallet,
  removeWallet,
  setActiveWallet,
  setPendingConnector,
  setPendingWallet,
  updateWallet,
} = walletSlice.actions;

const {getInitialState, reducer} = walletSlice;

describe('walletSlice', () => {
  describe('addWallet', () => {
    it('adds a wallet to the list of connected wallets and updates the active wallet', () => {
      // Ensure we're working with a clean state.
      expect(getInitialState().connectedWallets).toHaveLength(0);

      expect(reducer(initialState, addWallet(DEFAULT_WALLET))).toStrictEqual({
        ...initialState,
        connectedWallets: [DEFAULT_WALLET],
        activeWallet: DEFAULT_WALLET,
      });
    });

    it('does not add a wallet if the address is already in the connected wallets collection', () => {
      const existingState = {
        ...initialState,
        connectedWallets: [DEFAULT_WALLET],
      };

      expect(reducer(existingState, addWallet(DEFAULT_WALLET))).toStrictEqual(
        existingState,
      );
    });
  });

  describe('removeWallet', () => {
    it('removes the wallet when it exists', () => {
      const existingState = {
        ...initialState,
        connectedWallets: [DEFAULT_WALLET],
      };

      expect(
        reducer(existingState, removeWallet(DEFAULT_WALLET)),
      ).toStrictEqual(initialState);
    });

    it('does not remove a wallet if the wallet to remove is not found', () => {
      const existingState = {
        ...initialState,
        connectedWallets: [DEFAULT_WALLET],
      };

      expect(
        reducer(existingState, removeWallet(ALTERNATE_WALLET)),
      ).toStrictEqual(existingState);
    });

    it('sets the activeWallet to undefined if the address matches', () => {
      const existingState = {
        ...initialState,
        activeWallet: DEFAULT_WALLET,
        connectedWallets: [DEFAULT_WALLET],
      };

      expect(
        reducer(existingState, removeWallet(DEFAULT_WALLET)),
      ).toStrictEqual(initialState);
    });

    it('does not set the active wallet to undefined if the disconnected address is different', () => {
      const existingState = {
        ...initialState,
        activeWallet: ALTERNATE_WALLET,
        connectedWallets: [DEFAULT_WALLET, ALTERNATE_WALLET],
      };

      expect(
        reducer(existingState, removeWallet(DEFAULT_WALLET)),
      ).toStrictEqual({
        ...initialState,
        activeWallet: ALTERNATE_WALLET,
        connectedWallets: [ALTERNATE_WALLET],
      });
    });
  });

  describe('setActiveWallet', () => {
    it('sets activeWallet to provided wallet', () => {
      expect(
        reducer(initialState, setActiveWallet(DEFAULT_WALLET)),
      ).toStrictEqual({
        ...initialState,
        activeWallet: DEFAULT_WALLET,
      });
    });

    it('sets activeWallet to undefined when passed undefined', () => {
      const existingState = {
        ...initialState,
        activeWallet: DEFAULT_WALLET,
      };

      expect(reducer(existingState, setActiveWallet(undefined))).toStrictEqual(
        initialState,
      );
    });
  });

  describe('setPendingConnector', () => {
    it('sets pendingConnector to given value', () => {
      expect(
        reducer(
          initialState,
          setPendingConnector(DEFAULT_SERIALIZED_CONNECTOR),
        ),
      ).toStrictEqual({
        ...initialState,
        pendingConnector: DEFAULT_SERIALIZED_CONNECTOR,
      });
    });

    it('sets pendingConnector to undefined', () => {
      const existingState = {
        ...initialState,
        pendingConnector: DEFAULT_SERIALIZED_CONNECTOR,
      };

      expect(reducer(existingState, setPendingConnector())).toStrictEqual(
        initialState,
      );
    });
  });

  describe('setPendingWallet', () => {
    it('sets pendingWallet to provided wallet', () => {
      expect(
        reducer(initialState, setPendingWallet(DEFAULT_WALLET)),
      ).toStrictEqual({
        ...initialState,
        pendingWallet: DEFAULT_WALLET,
      });
    });

    it('sets pending wallet to undefined when passed undefined', () => {
      const existingState = {
        ...initialState,
        pendingWallet: DEFAULT_WALLET,
      };

      expect(reducer(existingState, setPendingWallet(undefined))).toStrictEqual(
        initialState,
      );
    });
  });

  describe('updateWallet', () => {
    it('updates a wallet when it exists and updates the active wallet when the address matches', () => {
      const existingState = {
        ...initialState,
        activeWallet: DEFAULT_WALLET,
        connectedWallets: [DEFAULT_WALLET],
      };

      const updatedWallet = {
        ...DEFAULT_WALLET,
        connectorId: 'rainbow',
        connectorName: 'Rainbow',
        displayName: 'connect-wallet-test.eth',
      };

      expect(reducer(existingState, updateWallet(updatedWallet))).toStrictEqual(
        {
          ...initialState,
          activeWallet: updatedWallet,
          connectedWallets: [updatedWallet],
        },
      );
    });

    it('updates a wallet when it exists and does not update the active wallet if the address does not match', () => {
      const existingState = {
        ...initialState,
        activeWallet: ALTERNATE_WALLET,
        connectedWallets: [DEFAULT_WALLET, ALTERNATE_WALLET],
      };

      const updatedWallet = {
        ...DEFAULT_WALLET,
        connectorId: 'rainbow',
        connectorName: 'Rainbow',
        displayName: 'connect-wallet-test.eth',
      };

      expect(reducer(existingState, updateWallet(updatedWallet))).toStrictEqual(
        {
          ...initialState,
          activeWallet: ALTERNATE_WALLET,
          connectedWallets: [updatedWallet, ALTERNATE_WALLET],
        },
      );
    });

    it('does not update a wallet if the wallet to update is not found', () => {
      const existingState = {
        ...initialState,
        connectedWallets: [DEFAULT_WALLET],
      };

      expect(
        reducer(existingState, updateWallet(ALTERNATE_WALLET)),
      ).toStrictEqual(existingState);
    });

    /**
     * Adding a note here that I'm not particularly certain if this is the desired outcome
     * or not.
     *
     * That being, when `updateWallet` is called and the previous wallet has an
     * optional key defined, such as `signedOn`, but the payload has an undefined value.
     *
     * In this case, the expected behavior (currently) would be that we update `signedOn`
     * would become undefined, trusting that the payload is the source of truth.
     */
    it('updates defined keys to undefined as expected', () => {
      const signedWallet = {
        ...DEFAULT_WALLET,
        signedOn: new Date().toISOString(),
      };

      const updatedWallet = {
        ...DEFAULT_WALLET,
        connectorId: 'rainbow',
        connectorName: 'Rainbow',
        /**
         * In this test, the signedOn will only be updated IF it is explicitly provided
         * as an undefined value. If the key is omitted, then it is not merged and does
         * not overwrite the previous value.
         */
        signedOn: undefined,
      };

      const previousState = {
        ...initialState,
        connectedWallets: [signedWallet],
      };

      const updatedState = {
        ...initialState,
        connectedWallets: [updatedWallet],
      };

      expect(reducer(previousState, updateWallet(updatedWallet))).toStrictEqual(
        updatedState,
      );
    });
  });

  describe('validatePendingWallet', () => {
    it('does not manipulate state when state.pendingWallet is undefined', () => {
      const action = validatePendingWallet.fulfilled({valid: true}, '', {
        ...DEFAULT_WALLET,
        ...VALID_SIGNATURE_RESPONSE,
      });

      expect(() => reducer(initialState, action)).toThrow(
        new ConnectWalletError('There is not a wallet pending validation'),
      );
    });

    it('does not manipulate state and throws an error when the address is not verified via ethers verifyMessage util', () => {
      const existingState = {
        ...initialState,
        pendingWallet: DEFAULT_WALLET,
      };

      const action = validatePendingWallet.rejected(
        'Address that signed message does not match the connected address' as any,
        '',
        {
          ...DEFAULT_WALLET,
          ...INVALID_SIGNATURE_RESPONSE,
        },
      );

      expect(() => reducer(existingState, action)).toThrow(
        new ConnectWalletError(
          'Address that signed message does not match the connected address',
        ),
      );
    });

    it('manipulates state when the address from verifyMessage matches the pendingWallet address', () => {
      const existingState = {
        ...initialState,
        pendingWallet: DEFAULT_WALLET,
      };

      const action = validatePendingWallet.fulfilled({valid: true}, '', {
        ...DEFAULT_WALLET,
        ...VALID_SIGNATURE_RESPONSE,
      });

      /**
       * Dispatch the action to our state and grab connectedWallets
       * and pendingWallet.
       */
      const {connectedWallets} = reducer(existingState, action);

      /**
       * We have to use objectContaining here because the dateSigned
       * is propogated inside of the action that is dispatched.
       */
      expect(connectedWallets).toStrictEqual(
        expect.arrayContaining([expect.objectContaining({...DEFAULT_WALLET})]),
      );
    });
  });
});
